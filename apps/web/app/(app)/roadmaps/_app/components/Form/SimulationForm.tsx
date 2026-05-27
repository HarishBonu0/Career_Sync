import { useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { SimulationInput, SkillProfile } from '../../types/index';
import SkillsInput from './SkillsInput';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SimulationFormProps {
  onSubmit: (input: SimulationInput) => void;
  isLoading: boolean;
}

export default function SimulationForm({ onSubmit, isLoading }: SimulationFormProps) {
  const [formData, setFormData] = useState({
    currentRole: '',
    experienceYears: '',
    currentSalary: '',
    expectedSalary: '',
    targetRole: '',
    skills: [] as SkillProfile[],
    dailyLearningTime: '',
    resumeFileName: '',
    resumeText: '',
  });

  const isStudent = formData.currentRole.trim().toLowerCase() === 'student';

  const isFormValid =
    formData.currentRole.trim() !== '' &&
    formData.targetRole.trim() !== '' &&
    formData.skills.length > 0 &&
    formData.dailyLearningTime.trim() !== '' &&
    (isStudent || (formData.experienceYears.trim() !== '' && formData.currentSalary.trim() !== ''));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'currentRole') {
      const nextIsStudent = value.trim().toLowerCase() === 'student';
      setFormData((prev) => ({
        ...prev,
        currentRole: value,
        experienceYears: nextIsStudent ? '' : prev.experienceYears,
        currentSalary: nextIsStudent ? '' : prev.currentSalary,
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (skills: SkillProfile[]) => {
    setFormData((prev) => ({ ...prev, skills }));
  };

  const extractResumeText = async (file: File): Promise<string> => {
    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith('.txt') || lowerName.endsWith('.md')) {
      return (await file.text()).slice(0, 8000);
    }
    if (lowerName.endsWith('.docx')) {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return (result.value || '').replace(/\s+/g, ' ').trim().slice(0, 8000);
    }
    if (lowerName.endsWith('.pdf')) {
      const pdfjs = await import('pdfjs-dist');
      const anyPdfjs = pdfjs as unknown as {
        getDocument: (src: { data: Uint8Array }) => { promise: Promise<any> };
        GlobalWorkerOptions: { workerSrc: string };
      };
      anyPdfjs.GlobalWorkerOptions.workerSrc =
        'https://unpkg.com/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs';
      const data = new Uint8Array(await file.arrayBuffer());
      const pdf = await anyPdfjs.getDocument({ data }).promise;
      let text = '';
      for (let page = 1; page <= pdf.numPages; page += 1) {
        const pageData = await pdf.getPage(page);
        const content = await pageData.getTextContent();
        const pageText = content.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ');
        text += ` ${pageText}`;
      }
      return text.replace(/\s+/g, ' ').trim().slice(0, 8000);
    }
    return '';
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFormData((prev) => ({ ...prev, resumeFileName: '', resumeText: '' }));
      return;
    }
    let extractedText = '';
    try {
      extractedText = await extractResumeText(file);
    } catch (error) {
      console.warn('Resume extraction failed, proceeding without extracted text:', error);
    }
    setFormData((prev) => ({
      ...prev,
      resumeFileName: file?.name || '',
      resumeText: extractedText,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    const parsedHours = parseFloat(formData.dailyLearningTime.match(/[\d.]+/)?.[0] || '0');
    onSubmit({
      currentRole: formData.currentRole,
      experienceYears: isStudent ? '' : formData.experienceYears,
      currentSalary: isStudent ? '' : formData.currentSalary,
      targetRole: formData.targetRole,
      skills: formData.skills,
      dailyLearningTime: formData.dailyLearningTime,
      dailyStudyHours: parsedHours > 0 ? parsedHours : 1,
      targetSalary: formData.expectedSalary.trim() || (isStudent ? undefined : formData.currentSalary),
      resumeFileName: formData.resumeFileName || undefined,
      resumeText: formData.resumeText || undefined,
      projects: '',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Roadmap generator</CardTitle>
        <CardDescription>Tell us about yourself to generate your personalized career roadmap.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          <Field
            id="currentRole"
            label="Current role"
            placeholder="Student, Software Developer, Data Analyst, Mechanical Engineer"
            value={formData.currentRole}
            onChange={handleInputChange}
            disabled={isLoading}
          />

          {!isStudent && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="experienceYears"
                label="Years of experience in current role"
                placeholder="e.g. 1 year, 2.5 years, 5 years"
                value={formData.experienceYears}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <Field
                id="currentSalary"
                label="Current annual salary"
                placeholder="e.g. ₹6 LPA, ₹8 LPA, ₹12 LPA"
                value={formData.currentSalary}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
          )}

          <Field
            id="targetRole"
            label="Target role"
            placeholder="e.g. AI Engineer, Data Scientist, Full Stack Developer, DevOps Engineer"
            value={formData.targetRole}
            onChange={handleInputChange}
            disabled={isLoading}
          />

          <SkillsInput skills={formData.skills} onSkillsChange={handleSkillsChange} />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="dailyLearningTime"
              label="Daily time you can dedicate to learning"
              placeholder="e.g. 1 hour, 2 hours, 3 hours"
              value={formData.dailyLearningTime}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <Field
              id="expectedSalary"
              label="Expected annual salary"
              placeholder="e.g. ₹10 LPA, ₹15 LPA, $70K"
              value={formData.expectedSalary}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="resumeUpload">Upload resume (optional)</Label>
            <label
              htmlFor="resumeUpload"
              className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-dashed border-border bg-muted/30 px-4 py-3 text-sm transition-colors hover:bg-muted/60"
            >
              <span className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {formData.resumeFileName || 'PDF, DOCX, or plain text'}
                </span>
              </span>
              {formData.resumeFileName && (
                <span className="text-xs font-medium text-foreground">Replace</span>
              )}
            </label>
            <input
              id="resumeUpload"
              type="file"
              accept=".pdf,.docx,.txt,.md"
              onChange={handleResumeUpload}
              className="sr-only"
              disabled={isLoading}
            />
          </div>
        </CardContent>

        <div className="px-6 pb-6">
          <Button type="submit" className="w-full" disabled={!isFormValid || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating skill assessment…
              </>
            ) : (
              'Generate skill assessment'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function Field({
  id,
  label,
  placeholder,
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="text"
        name={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

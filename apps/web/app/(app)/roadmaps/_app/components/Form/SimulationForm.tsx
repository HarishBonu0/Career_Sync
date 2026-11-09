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
    resumeTextOriginalLength: 0,
    resumeTextTruncated: false,
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

  const extractResumeText = async (file: File): Promise<{ text: string, originalLength: number }> => {
    const lowerName = file.name.toLowerCase();
    let rawText = '';
    
    if (lowerName.endsWith('.txt') || lowerName.endsWith('.md')) {
      rawText = await file.text();
    } else if (lowerName.endsWith('.docx')) {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      rawText = (result.value || '').replace(/\s+/g, ' ').trim();
    } else if (lowerName.endsWith('.pdf')) {
      const pdfjs = await import('pdfjs-dist');
      const anyPdfjs = pdfjs as unknown as {
        getDocument: (src: { data: Uint8Array }) => { promise: Promise<any> };
        GlobalWorkerOptions: { workerSrc: string };
      };
      anyPdfjs.GlobalWorkerOptions.workerSrc =
        'https://unpkg.com/pdfjs-dist@5.7.284/build/pdf.worker.min.mjs';
      const data = new Uint8Array(await file.arrayBuffer());
      const pdf = await anyPdfjs.getDocument({ data }).promise;
      
      for (let page = 1; page <= pdf.numPages; page += 1) {
        const pageData = await pdf.getPage(page);
        const content = await pageData.getTextContent();
        const pageText = content.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ');
        rawText += ` ${pageText}`;
      }
      rawText = rawText.replace(/\s+/g, ' ').trim();
    }
    
    return { text: rawText.slice(0, 80000), originalLength: rawText.length };
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFormData((prev) => ({ ...prev, resumeFileName: '', resumeText: '' }));
      return;
    }
    let extractedText = '';
    let originalLength = 0;
    try {
      const result = await extractResumeText(file);
      extractedText = result.text;
      originalLength = result.originalLength;
    } catch (error) {
      console.warn('Resume extraction failed, proceeding without extracted text:', error);
    }
    setFormData((prev) => ({
      ...prev,
      resumeFileName: file?.name || '',
      resumeText: extractedText,
      resumeTextOriginalLength: originalLength,
      resumeTextTruncated: originalLength > 80000,
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
      resumeTextOriginalLength: formData.resumeTextOriginalLength,
      resumeTextTruncated: formData.resumeTextTruncated,
      projects: '',
    });
  };

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl font-bold text-primary">Roadmap generator</CardTitle>
        <CardDescription className="text-secondary-foreground font-medium text-base">Tell us about yourself to generate your personalized career roadmap.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 px-0">
          <Field
            id="currentRole"
            label="Current role"
            placeholder="Student, Software Developer, Data Analyst, Mechanical Engineer"
            value={formData.currentRole}
            onChange={handleInputChange}
            disabled={isLoading}
          />

          {!isStudent && (
            <div className="grid gap-6 sm:grid-cols-2">
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

          <div className="grid gap-6 sm:grid-cols-2">
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

          <div className="space-y-2">
            <Label htmlFor="resumeUpload" className="text-sm font-bold text-primary">Upload resume (optional)</Label>
            <label
              htmlFor="resumeUpload"
              className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 border-dashed border-border/80 bg-white px-5 py-4 text-sm transition-all hover:bg-accent/5 hover:border-accent/40 group"
            >
              <span className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:scale-110 transition-transform">
                  <Upload className="h-5 w-5" />
                </div>
                <span className="text-secondary-foreground font-medium text-base">
                  {formData.resumeFileName || 'PDF, DOCX, or plain text'}
                </span>
              </span>
              {formData.resumeFileName && (
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Replace</span>
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

        <div className="pt-6">
          <Button type="submit" size="lg" className="w-full h-14 rounded-full text-base font-bold shadow-lg shadow-accent/20 bg-primary text-white hover:bg-primary/90 transition-transform hover:-translate-y-0.5" disabled={!isFormValid || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating intelligence...
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
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-bold text-primary">{label}</Label>
      <Input
        id={id}
        type="text"
        name={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="h-12 rounded-xl border-border/80 bg-white px-4 text-base focus-visible:ring-accent focus-visible:border-accent transition-all font-medium placeholder:text-muted-foreground/60"
      />
    </div>
  );
}

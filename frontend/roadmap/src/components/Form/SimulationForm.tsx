import { useState } from 'react';
import { SimulationInput, SkillProfile } from '../../types/index';
import SkillsInput from './SkillsInput';
import styles from './SimulationForm.module.css';

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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSkillsChange = (skills: SkillProfile[]) => {
    setFormData((prev) => ({
      ...prev,
      skills,
    }));
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
      setFormData((prev) => ({
        ...prev,
        resumeFileName: '',
        resumeText: '',
      }));
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
    if (isFormValid) {
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
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={styles.title}>Roadmap Generator</h1>
      <p className={styles.subtitle}>
        Tell us about yourself to generate your personalized career roadmap.
      </p>

      <div>
        <label htmlFor="currentRole" className={styles.label}>
          Current Role
        </label>
        <input
          id="currentRole"
          type="text"
          name="currentRole"
          placeholder="Student, Software Developer, Data Analyst, Mechanical Engineer"
          value={formData.currentRole}
          onChange={handleInputChange}
          className={styles.input}
          disabled={isLoading}
        />
      </div>

      {!isStudent && (
        <div className={styles.formGrid}>
          <div>
            <label htmlFor="experienceYears" className={styles.label}>
              Years of Experience in Current Role
            </label>
            <input
              id="experienceYears"
              type="text"
              name="experienceYears"
              placeholder="e.g. 1 year, 2.5 years, 5 years"
              value={formData.experienceYears}
              onChange={handleInputChange}
              className={styles.input}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="currentSalary" className={styles.label}>
              Current Annual Salary
            </label>
            <input
              id="currentSalary"
              type="text"
              name="currentSalary"
              placeholder="e.g. ₹6 LPA, ₹8 LPA, ₹12 LPA"
              value={formData.currentSalary}
              onChange={handleInputChange}
              className={styles.input}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="targetRole" className={styles.label}>
          Target Role
        </label>
        <input
          id="targetRole"
          type="text"
          name="targetRole"
          placeholder="e.g. AI Engineer, Data Scientist, Full Stack Developer, DevOps Engineer"
          value={formData.targetRole}
          onChange={handleInputChange}
          className={styles.input}
          disabled={isLoading}
        />
      </div>

      <div>
        <SkillsInput skills={formData.skills} onSkillsChange={handleSkillsChange} />
      </div>

      <div>
        <label htmlFor="dailyLearningTime" className={styles.label}>
          How much time can you dedicate daily to learning?
        </label>
        <input
          id="dailyLearningTime"
          type="text"
          name="dailyLearningTime"
          placeholder="e.g. 1 hour, 2 hours, 3 hours"
          value={formData.dailyLearningTime}
          onChange={handleInputChange}
          className={styles.input}
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="expectedSalary" className={styles.label}>
          Expected Annual Salary
        </label>
        <input
          id="expectedSalary"
          type="text"
          name="expectedSalary"
          placeholder="e.g. ₹10 LPA, ₹15 LPA, $70K"
          value={formData.expectedSalary}
          onChange={handleInputChange}
          className={styles.input}
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="resumeUpload" className={styles.label}>
          Upload Resume (optional)
        </label>
        <input
          id="resumeUpload"
          type="file"
          accept=".pdf,.docx"
          onChange={handleResumeUpload}
          className={styles.input}
          disabled={isLoading}
        />
      </div>

      {formData.resumeFileName && (
        <p className={styles.resumeInfo}>Selected file: {formData.resumeFileName}</p>
      )}

      <button
        type="submit"
        disabled={!isFormValid || isLoading}
        className={styles.submitBtn}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner}></span>
            Generating Skill Assessment...
          </>
        ) : (
          'Generate Skill Assessment'
        )}
      </button>
    </form>
  );
}

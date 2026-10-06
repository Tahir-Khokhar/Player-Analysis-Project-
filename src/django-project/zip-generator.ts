import JSZip from 'jszip';
import { DJANGO_PROJECT_FILES } from './project-files';

export async function downloadDjangoProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Root directory name in zip
  const rootFolder = zip.folder('sports_analytics_drf_ml');

  if (!rootFolder) return;

  for (const file of DJANGO_PROJECT_FILES) {
    rootFolder.file(file.path, file.content);
  }

  // Generate zip file as blob
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'sports_analytics_drf_ml_project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

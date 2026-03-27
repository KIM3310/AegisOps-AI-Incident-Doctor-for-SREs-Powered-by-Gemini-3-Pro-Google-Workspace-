import type { IncidentReport, GoogleSlideInfo } from '../types';
import { googleApiFetch, googleApiJson } from './googleApiClient';

type SlideSection = { title: string; body: string };

function buildSlideSections(report: IncidentReport): SlideSection[] {
  return [
    {
      title: `[${report.severity}] ${report.title}`,
      body: [
        report.summary || 'N/A',
        '',
        `Users: ${report.impact?.estimatedUsersAffected || 'N/A'}`,
        `Duration: ${report.impact?.duration || 'N/A'}`,
      ].join('\n'),
    },
    {
      title: 'Timeline',
      body: report.timeline.length
        ? report.timeline.slice(0, 6).map((t) => `- ${t.time}: ${t.description}`).join('\n')
        : 'N/A',
    },
    {
      title: 'Root Causes',
      body: report.rootCauses.length
        ? report.rootCauses.map((c, i) => `${i + 1}. ${c}`).join('\n')
        : 'N/A',
    },
    {
      title: 'Action Items',
      body: report.actionItems.length
        ? report.actionItems.slice(0, 6).map((a, i) => `${i + 1}. [${a.priority}] ${a.task}`).join('\n')
        : 'N/A',
    },
  ];
}

export async function createIncidentSlides(accessToken: string, report: IncidentReport): Promise<GoogleSlideInfo> {
  const presentation = await googleApiJson<any>({
    accessToken,
    label: 'Google Slides create presentation',
    url: 'https://slides.googleapis.com/v1/presentations',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: `[${report.severity}] ${report.title} - Incident Report` }),
  });
  const presentationId = String(presentation.presentationId || '').trim();
  const defaultSlideId = String(presentation.slides?.[0]?.objectId || '').trim();
  if (!presentationId) {
    throw new Error('Google Slides API returned no presentationId.');
  }

  const sections = buildSlideSections(report);
  const requests: any[] = [];
  sections.forEach((slide, index) => {
    const slideId = `aegis_slide_${index + 1}`;
    const titleId = `${slideId}_title`;
    const bodyId = `${slideId}_body`;

    requests.push({
      createSlide: {
        objectId: slideId,
        insertionIndex: index + 1,
        slideLayoutReference: { predefinedLayout: 'TITLE_AND_BODY' },
        placeholderIdMappings: [
          { layoutPlaceholder: { type: 'TITLE', index: 0 }, objectId: titleId },
          { layoutPlaceholder: { type: 'BODY', index: 0 }, objectId: bodyId },
        ],
      },
    });
    requests.push({
      insertText: {
        objectId: titleId,
        text: slide.title || 'Untitled',
        insertionIndex: 0,
      },
    });
    requests.push({
      insertText: {
        objectId: bodyId,
        text: slide.body || 'N/A',
        insertionIndex: 0,
      },
    });
  });

  if (defaultSlideId) {
    requests.push({
      deleteObject: {
        objectId: defaultSlideId,
      },
    });
  }

  await googleApiFetch({
    accessToken,
    label: 'Google Slides batchUpdate',
    url: `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests }),
  });

  return {
    id: presentationId,
    name: String(presentation.title || `[${report.severity}] ${report.title} - Incident Report`),
    url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
  };
}

export const SlidesService = { createIncidentSlides };
export default SlidesService;

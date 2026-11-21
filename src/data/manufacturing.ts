import type { ManufacturingStage } from '../types/catalog';

/**
 * Manufacturing Capability Outline (Configurable Template)
 * ---------------------------------------------------------------------------
 * Enable or disable individual stages based strictly on the processes
 * verified to be performed in-house by the manufacturer.
 */
export const manufacturingStages: ManufacturingStage[] = [
  {
    index: '01',
    title: 'Material Selection & Preparation',
    summary:
      'Alloy verification and blank sizing matched to each instrument family and functional load.',
    details: [
      'Martensitic and austenitic surgical stainless-steel grades configured per pattern',
      'Batch identification prior to hot forging or bar machining',
    ],
    enabled: true,
    isDemoContent: true,
  },
  {
    index: '02',
    title: 'Forming & Precision Machining',
    summary:
      'Controlled geometry across shanks, jaws, box locks, and ergonomic handle profiles.',
    details: [
      'Forged blank trimming and CNC / fixture milling for repeatable tolerances',
      'Jaw serration, tooth alignment, and ratchet engagement fitting',
    ],
    enabled: true,
    isDemoContent: true,
  },
  {
    index: '03',
    title: 'Heat Treatment & Surface Finishing',
    summary:
      'Hardening, tempering, and non-reflective satin or mirror finishing for clinical glare control.',
    details: [
      'Controlled heat treatment calibrated to cutting vs. clamping steel alloys',
      'Satin anti-glare brushing, passivation, and ultrasonic cleaning',
    ],
    enabled: true,
    isDemoContent: true,
  },
  {
    index: '04',
    title: 'Inspection & Export Packaging',
    summary:
      'Individual functional verification, laser marking, and protective export packing.',
    details: [
      'Dimensional, jaw-closure, cutting-edge, and joint-tension inspection',
      'Private-label laser etching, individual pouches, and export cartons',
    ],
    enabled: true,
    isDemoContent: true,
  },
];

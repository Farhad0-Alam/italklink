// Main exports for FormBuilder module
export { FormBuilder } from './components/FormBuilder';
export { useFormBuilder } from './hooks/useFormBuilder';
export type { FormBuilderProps, FormBuilderConfig } from './types';

// Module metadata
export const formBuilderModule = {
  name: 'FormBuilder',
  version: '1.0.0',
  description: 'Form Builder module for TalkLink',
  type: 'feature'
};

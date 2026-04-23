import '@testing-library/jest-dom';

if (!URL.createObjectURL) {
  URL.createObjectURL = () => 'blob:mock-preview';
}

if (!URL.revokeObjectURL) {
  URL.revokeObjectURL = () => undefined;
}

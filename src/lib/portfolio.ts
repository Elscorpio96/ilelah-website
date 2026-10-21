/** Display labels for portfolio project statuses. */
export const statusLabel: Record<string, string> = {
  product: 'Product',
  production: 'In use',
  prototype: 'Prototype',
  internal: 'Internal project',
  demonstration: 'Demonstration',
};

export const statusHelp: Record<string, string> = {
  product: 'One of our own products, developed and supported by Ilelah Technologies.',
  production: 'Built for a client and in real use.',
  prototype: 'An early working version built to test an idea.',
  internal: 'Built for our own use.',
  demonstration: 'Built to demonstrate an approach; not in live use.',
};

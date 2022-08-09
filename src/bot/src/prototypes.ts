import 'colors';

function curr_time() {
  const date = new Date();
  return `[${date.toLocaleDateString()} ${date.toLocaleTimeString()}] `;
}

const log = console.log;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
console.log = function (...args: any[]) {
  process.stdout.write(curr_time().white);
  log(...args);
};

//  process.stdout.write(curr_time().white);
//  log(...args);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
console.warn = function (...args: any[]) {
  process.stdout.write(curr_time().yellow);
  log(...args.map((arg) => (typeof arg === 'string' ? arg.yellow : arg)));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
console.error = function (...args: any[]) {
  process.stdout.write(curr_time().red);
  log(...args.map((arg) => (typeof arg === 'string' ? arg.red : arg)));
};

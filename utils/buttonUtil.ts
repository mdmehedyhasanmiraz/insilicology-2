export function cnButton(...inputs: (string | false | null | undefined)[]) {
  return inputs.filter(Boolean).join(" ");
}
  
/**
 * takes the input from template literal and returns a string
 */
export default function css(
  strings: TemplateStringsArray,
  ...values: unknown[]
) {
  let output = ""
  for (const [i, string_] of strings.entries()) {
    output += string_
    if (values[i]) {
      output += values[i]
    }
  }
  return output
}

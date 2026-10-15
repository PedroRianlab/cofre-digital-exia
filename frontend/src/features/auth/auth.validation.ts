export function validPassword(value: string) {
  return value.length >= 8 && value.length <= 128;
}

export class HexToRgb {

  constructor(
    public hex?: string,
    public alpha?: string
  ) { }

  public convert(hex, alpha): any {
    hex = !!hex ? '#' + Math.floor(Math.random() * 16777215).toString(16) : hex;
    const r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
      return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
    } else {
      return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }
  }
}

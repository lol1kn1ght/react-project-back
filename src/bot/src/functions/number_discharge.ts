export function number_discharge(number: number) {
  try {
    if (!number && number !== 0) throw new Error('Аргумент не является числом');
    if (!Number.isInteger(number))
      throw new Error('Аргумент не является числом');
    // if (number === 0) return 0
    const betweens_result = `${number}`;
    const result = betweens_result.replace(
      /(\d)(?=(\d\d\d)+([^\d]|$))/g,
      '$1 '
    );
    return result;
  } catch (e) {
    return (<Error>e).message;
  }
}

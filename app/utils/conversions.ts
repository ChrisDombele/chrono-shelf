interface NumberToFormatProps {
  number: number;
  currency: string;
}

function numberToFormat({ number, currency }: NumberToFormatProps) {
  return number.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'currency',
    currency: currency,
  });
}

export { numberToFormat };


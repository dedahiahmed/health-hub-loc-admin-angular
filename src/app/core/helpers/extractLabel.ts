interface LabelValue {
  label: string;
  value: string;
}

export const extractLabel = (value: string, array: LabelValue[]): string => {
  const found = array.find((item) => item.value === value);
  return found?.label || value;
};


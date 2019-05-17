export function isSubSetOf<T>(obj: T, target: any) {
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }
    const prop = obj[key];
    const targetProp = target[key];

    if (typeof prop === 'object' && typeof targetProp === 'object') {
      if (!isSubSetOf(prop, targetProp)) {
        return false;
      }
    } else if (prop !== targetProp) {
      return false;
    }
  }
  return true;
}

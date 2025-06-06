// 生成普通随机数
const randomMethodNormal = (length: number) => Math.floor(Math.random() * length);

// 生成随机数，值越小，概率越大
const randomMethodSmallerTheValueHigherTheProbability = (length: number) => {
  const strength = 2;
  // strength 控制递减强度
  const random = Math.pow(Math.random(), strength);
  return Math.floor(random * length);
};

// 获取随机 index
export type RandomStrategy = 'normal' | 'smallerHigher';
export const getRandomIndex = (length: number, strategy: RandomStrategy = 'normal') => {
  switch (strategy) {
    case 'smallerHigher':
      return randomMethodSmallerTheValueHigherTheProbability(length);
    case 'normal':
    default:
      return randomMethodNormal(length);
  }
};

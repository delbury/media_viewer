import { RandomPlayStrategy } from '#/components/GlobalSetting';

// 生成普通随机数
const randomMethodNormal = (length: number) => Math.floor(Math.random() * length);

// 生成随机数，值越小，概率越大
const randomMethodSmallerTheValueHigherTheProbability = (length: number) => {
  const strength = 2;
  // strength 控制递减强度
  const random = Math.pow(Math.random(), strength);
  return Math.floor(random * length);
};

// 生成随机数，值越大，概率越大
const randomMethodBiggerTheValueHigherTheProbability = (length: number) => {
  const strength = 2;
  // strength 控制递减强度
  const random = Math.pow(Math.random(), strength);
  return length - Math.ceil(random * length);
};

// 获取随机 index
export const getRandomIndex = (length: number, strategy: RandomPlayStrategy) => {
  switch (strategy) {
    case RandomPlayStrategy.NewFirst:
      return randomMethodSmallerTheValueHigherTheProbability(length);
    case RandomPlayStrategy.OldFirst:
      return randomMethodBiggerTheValueHigherTheProbability(length);
    default:
      return randomMethodNormal(length);
  }
};

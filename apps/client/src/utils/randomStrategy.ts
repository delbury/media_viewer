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

// 高斯分布
const randomTriangularCenter = (length: number, highest: number = Math.floor(length / 2)) => {
  // 使用三角分布
  const u = Math.random();

  // 标准化M的位置 (0到1之间)
  const c = highest / length;

  let result;
  if (u <= c) {
    result = Math.floor(length * Math.sqrt(u * c));
  } else {
    result = Math.floor(length * (1 - Math.sqrt((1 - u) * (1 - c))));
  }

  return Math.min(result, length);
};

// 获取随机 index
export const getRandomIndex = (length: number, strategy: RandomPlayStrategy) => {
  switch (strategy) {
    case RandomPlayStrategy.NewFirst:
      return randomMethodSmallerTheValueHigherTheProbability(length);
    case RandomPlayStrategy.OldFirst:
      return randomMethodBiggerTheValueHigherTheProbability(length);
    case RandomPlayStrategy.CenterFirst:
      return randomTriangularCenter(length);
    default:
      return randomMethodNormal(length);
  }
};

/**
 * Created by GalBenEvgi on 1/28/2017.
 */

export interface Frequency {
  letter: string,
  frequency: number
}
export const STATISTICS: Frequency[] = [
  {letter: "A", frequency: .08167},
  {letter: "B", frequency: .01492},
  {letter: "C", frequency: .02782},
  {letter: "D", frequency: .04253},
  {letter: "E", frequency: .12702},
  {letter: "F", frequency: .02288},
  {letter: "G", frequency: .02015},
  {letter: "Z", frequency: .00074},
];

export const Stats: any[] = [
  {age: "<5", population: 2704659},
  {age: "5-13", population: 4499890},
  {age: "≥65", population: 612463}
];

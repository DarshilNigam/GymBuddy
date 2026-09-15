export type ExerciseType = 'pushups' | 'situps' | 'squats' | 'pullups';

export type ExerciseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface ExerciseGuideStep {
  step: number;
  title: string;
  instruction: string;
  tip?: string;
}

export interface ExerciseConfig {
  id: ExerciseType;
  name: string;
  category: 'Upper Body' | 'Core' | 'Lower Body' | 'Full Body';
  difficulty: ExerciseDifficulty;
  description: string;
  detailedBio: string;
  targetMuscles: string[];
  caloriesPerRep: number;
  estimatedSecsPerRep: number;
  iconName: string;
  cameraSetupAdvice: string;
  idealAngle: string;
  keyLandmarks: string[];
  color: {
    primary: string;
    border: string;
    bgGlow: string;
  };
  instructions: ExerciseGuideStep[];
  formTips: string[];
  commonMistakes: string[];
}

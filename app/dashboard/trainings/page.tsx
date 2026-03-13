import { getTrainingMaterials } from "./actions";
import Providers from "./(sections)/Providers";
import TrainingCards from "./(sections)/TrainingCards";

export default async function TrainingsPage() {
  const trainings = await getTrainingMaterials();

  return (
    <Providers trainings={trainings}>
      <div className="p-8 mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trainings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Your training documents & resources
          </p>
        </div>
        <TrainingCards />
      </div>
    </Providers>
  );
}

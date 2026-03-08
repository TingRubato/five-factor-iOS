import { useUser } from '../../stores/userStore';
import CinematicResult from '../../components/cinematic/CinematicResult';

export default function ResultScreen() {
  const { user } = useUser();

  const scores = user?.scores || { O: 72, C: 55, E: 80, A: 60, N: 30 };
  const archetypeName = user?.primaryArchetype || 'Explorer Creator';

  return <CinematicResult scores={scores} archetypeName={archetypeName} />;
}

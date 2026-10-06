import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { PlayerRecord, TrainedModelResult, SportType } from '../types/sports-ml';

export async function syncUserProfile(user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }) {
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      email: user.email || 'user@example.com',
      displayName: user.displayName || 'Sports Analyst',
      photoURL: user.photoURL || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function savePlayerRecordToFirestore(player: PlayerRecord) {
  const user = auth.currentUser;
  if (!user) return;
  const path = `users/${user.uid}/player_records/${player.id}`;
  try {
    const recordRef = doc(db, 'users', user.uid, 'player_records', player.id);
    await setDoc(recordRef, {
      userId: user.uid,
      sport: player.sport,
      playerName: player.name,
      team: player.team,
      position: player.position,
      metrics: {
        ...player.features,
        ...player.targets,
        age: player.age,
      },
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveExperimentToFirestore(experiment: TrainedModelResult) {
  const user = auth.currentUser;
  if (!user) return;
  const expId = `exp_${Date.now()}`;
  const path = `users/${user.uid}/trained_experiments/${expId}`;
  try {
    const expRef = doc(db, 'users', user.uid, 'trained_experiments', expId);
    await setDoc(expRef, {
      userId: user.uid,
      sport: experiment.sport,
      algorithm: experiment.algorithm,
      targetName: experiment.targetId,
      taskType: experiment.taskType,
      metrics: experiment.metrics,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadUserSavedExperiments(): Promise<any[]> {
  const user = auth.currentUser;
  if (!user) return [];
  const path = `users/${user.uid}/trained_experiments`;
  try {
    const snap = await getDocs(collection(db, 'users', user.uid, 'trained_experiments'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

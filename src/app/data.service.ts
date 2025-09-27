import { Injectable } from '@angular/core';
import { ref, push, onValue, remove, get, update } from 'firebase/database';
import { database } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
// Save a new point
savePoint(point: { name: string, coordinates: string }) {
  const pointsRef = ref(database, 'points');
  return push(pointsRef, point);
}

deletePoint(key: string) {
 const pointRef = ref(database, `points/${key}`);
 return remove(pointRef);
}

updatePoint(key: string, point: { name: string, coordinates: string }) {
  const pointRef = ref(database, `points/${key}`);
  return update(pointRef, point);
}



//Get points
getPoints() {
 const pointsRef = ref(database, 'points');
  return new Promise((resolve, reject) => {
   onValue(pointsRef, (snapshot) => {
     const data = snapshot.val();
     resolve(data);
   }, (error) => {
     reject(error);
   });
 });
}

// ✅ Get single point by key
  getPoint(key: string) {
    const pointRef = ref(database, `points/${key}`);
    return new Promise((resolve, reject) => {
      get(pointRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            resolve(snapshot.val());
          } else {
            resolve(null);
          }
        })
        .catch((error) => reject(error));
    });
  }


}

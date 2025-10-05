import { Injectable } from '@angular/core';
import { ref, push, onValue, remove, get, update } from 'firebase/database';
import { database } from './firebase.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private _pointsChanged = new Subject<void>();

  get pointsChanged$() {
    return this._pointsChanged.asObservable();
  }

// Save a new point
savePoint(point: { name: string, coordinates: string }) {
  const pointsRef = ref(database, 'points');
  const promise = push(pointsRef, point);
  promise.then(() => this._pointsChanged.next());
  return promise;
}

deletePoint(key: string) {
 const pointRef = ref(database, `points/${key}`);
 const promise = remove(pointRef);
 promise.then(() => this._pointsChanged.next());
 return promise;
}

updatePoint(key: string, point: { name: string, coordinates: string }) {
  const pointRef = ref(database, `points/${key}`);
  const promise = update(pointRef, point);
  promise.then(() => this._pointsChanged.next());
  return promise;
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

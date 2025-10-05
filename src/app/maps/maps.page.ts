import { Component, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { DataService } from '../data.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';

const iconRetinaUrl = 'assets/icon/barca.png';
const iconUrl = 'assets/icon/barca.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [32, 32],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
  standalone: false,
})
export class MapsPage implements OnDestroy {

  private dataService = inject(DataService);
  private alertController = inject(AlertController);
  private router = inject(Router);
  private loadingCtrl = inject(LoadingController);

  map!: L.Map;
  private markers: L.Marker[] = [];
  private pointsChangedSubscription!: Subscription;

  constructor() {}

  ionViewWillEnter() {
    setTimeout(() => {
      if (!this.map) {
        this.map = L.map('map').setView([41.38124343249862, 2.1228706544810207], 13);

        const osm = L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            attribution: '&copy; OpenStreetMap contributors',
          }
        );

        osm.addTo(this.map);

        this.map.on('popupopen', (e) => {
          const popup = e.popup;
          const deleteLink = popup.getElement()?.querySelector('.delete-link');
          if (deleteLink) {
            deleteLink.addEventListener('click', (event) => {
              event.preventDefault();
              const key = (event.target as HTMLElement).closest('[data-key]')?.getAttribute('data-key');
              if (key) {
                this.confirmDelete(key);
              }
            });
          }

          const editLink = popup.getElement()?.querySelector('.edit-link');
          if (editLink) {
            editLink.addEventListener('click', (event) => {
              event.preventDefault();
              const key = (event.target as HTMLElement).closest('[data-key]')?.getAttribute('data-key');
              if (key) {
                this.confirmEdit(key);
              }
            });
          }
        });
      }
      this.loadPoints();
      this.pointsChangedSubscription = this.dataService.pointsChanged$.subscribe(() => {
        this.loadPoints();
      });
    }, 0);
  }

  ionViewDidLeave() {
    if (this.map) {
      this.map.remove();
      this.map = null as any;
    }
    if (this.pointsChangedSubscription) {
      this.pointsChangedSubscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    if (this.pointsChangedSubscription) {
      this.pointsChangedSubscription.unsubscribe();
    }
  }

  clearMarkers() {
    this.markers.forEach(marker => {
      marker.remove();
    });
    this.markers = [];
  }

  async loadPoints() {
    const loading = await this.loadingCtrl.create({
      message: 'Loading points...',
    });
    await loading.present();

    this.clearMarkers();

    try {
      const points: any = await this.dataService.getPoints();
      for (const key in points) {
        if (points.hasOwnProperty(key)) {
          const point = points[key];
          const coordinates = point.coordinates.split(',').map((c: string) => parseFloat(c));
          const marker = L.marker(coordinates as L.LatLngExpression).addTo(this.map);
          const popupContent = `
            <div class="popup-container">
              <div class="popup-header">
                <h3>${point.name}</h3>
              </div>
              <div class="popup-body">
                <span class="popup-description-label">Coordinates</span>
                <p class="popup-description">${point.coordinates}</p>
              </div>
              <div class="popup-actions">
                <a href="#" class="edit-link" data-key="${key}"><ion-icon name="create-outline" slot="start"></ion-icon>Edit</a>
                <a href="#" class="delete-link" data-key="${key}"><ion-icon name="trash-outline" slot="start"></ion-icon>Delete</a>
              </div>
            </div>`;
          marker.bindPopup(popupContent);
          this.markers.push(marker);
        }
      }
    } finally {
      await loading.dismiss();
    }
  }

  async confirmDelete(key: string) {
    const alert = await this.alertController.create({
      header: 'Konfirmasi',
      message: 'Apakah Anda yakin ingin menghapus point ini?',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Hapus',
          handler: () => {
            this.deletePoint(key);
          }
        }
      ]
    });

    await alert.present();
  }

  async deletePoint(key: string) {
    const loading = await this.loadingCtrl.create({
      message: 'Deleting point...',
    });
    await loading.present();
    try {
      await this.dataService.deletePoint(key);
      // No need to call loadPoints() here anymore, the subscription will handle it
    } catch (error: any) {
      const alert = await this.alertController.create({
        header: 'Delete Failed',
        message: error.message,
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      await loading.dismiss();
    }
  }

  async confirmEdit(key: string) {
    const alert = await this.alertController.create({
      header: 'Konfirmasi',
      message: 'Apakah Anda yakin ingin mengedit point ini?',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Edit',
          handler: () => {
            this.editPoint(key);
          }
        }
      ]
    });

    await alert.present();
  }

  editPoint(key: string) {
    this.router.navigate([`/editpoint/${key}`]);
  }
}

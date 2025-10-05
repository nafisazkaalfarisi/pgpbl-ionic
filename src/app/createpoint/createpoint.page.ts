import { Component, OnInit, inject } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { DataService } from '../data.service';
import * as L from 'leaflet';
import { auth } from '../firebase.service';
import { Router } from '@angular/router';

const iconRetinaUrl = 'assets/icon/barca.png'; // sama seperti maps.page.ts
const iconUrl = 'assets/icon/barca.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [32, 32],  // ukuran sama dengan MapsPage
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-createpoint',
  templateUrl: './createpoint.page.html',
  styleUrls: ['./createpoint.page.scss'],
  standalone: false,
})
export class CreatepointPage implements OnInit {
  map!: L.Map;

  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);
  private dataService = inject(DataService);
  private router = inject(Router);

  name = '';
  coordinates = '';

  constructor() {}

  ngOnInit() {
    setTimeout(() => {
      this.map = L.map('mapcreate').setView([41.38124343249862, 2.1228706544810207], 13);

      const osm = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }
      );

      const esri = L.tileLayer(
        'https://server..arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'ESRI',
        }
      );

      osm.addTo(this.map);

      const baseMaps = {
        OpenStreetMap: osm,
        'Esri World Imagery': esri,
      };

      L.control.layers(baseMaps).addTo(this.map);

      const tooltip =
        'Drag the marker or move the map<br>to change the coordinates<br>of the location';
      const marker = L.marker([41.38124343249862, 2.1228706544810207], { draggable: true });
      marker.addTo(this.map);
      marker.bindPopup(tooltip);
      marker.openPopup();

      marker.on('dragend', (e) => {
        const latlng = e.target.getLatLng();
        const lat = latlng.lat.toFixed(9);
        const lng = latlng.lng.toFixed(9);
        this.coordinates = lat + ',' + lng;
        console.log(this.coordinates);
      });
    });
  }

  async save() {
    if (!auth.currentUser) {
      const alert = await this.alertCtrl.create({
        header: 'Authentication Required',
        message: 'You need to be logged in to save a point.',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Login',
            handler: () => {
              this.router.navigate(['/login']);
            },
          },
        ],
      });
      await alert.present();
      return;
    }

    if (this.name && this.coordinates) {
      try {
        await this.dataService.savePoint({
          name: this.name,
          coordinates: this.coordinates,
        });
        this.router.navigate(['/tabs/maps']);
      } catch (error: any) {
        const alert = await this.alertCtrl.create({
          header: 'Save Failed',
          message: error.message,
          buttons: ['OK'],
        });
        await alert.present();
      }
    }
  }
}

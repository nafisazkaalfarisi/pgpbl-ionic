import { Component, OnInit, inject } from '@angular/core';
import * as L from 'leaflet';
import { DataService } from '../data.service';
import { AlertController } from '@ionic/angular';

const iconRetinaUrl = 'assets/icon/barca.png';
const iconUrl = 'assets/marker-icon.png';
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
export class MapsPage implements OnInit {

  private dataService = inject(DataService);
  private alertController = inject(AlertController);

  map!: L.Map;

  constructor() {}

  ngOnInit() {
    if (!this.map) {
      setTimeout(() => {
        this.map = L.map('map').setView([41.38124343249862, 2.1228706544810207], 13);

        const osm = L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            attribution: '&copy; OpenStreetMap contributors',
          }
        );

        osm.addTo(this.map);

        L.marker([41.38124343249862, 2.1228706544810207])
          .addTo(this.map)
          .bindPopup('Camp Nou, Barcelona')
          .openPopup();

        // ✅ panggil loadPoints setelah map siap
        this.loadPoints();
      });
    }
  }

  // ✅ method untuk load data marker dari database
  async loadPoints() {
    const points: any = await this.dataService.getPoints();
    for (const key in points) {
      if (points.hasOwnProperty(key)) {
        const point = points[key];
        const coordinates = point.coordinates.split(',').map((c: string) => parseFloat(c));
        const marker = L.marker(coordinates as L.LatLngExpression).addTo(this.map);
        marker.bindPopup(
          `${point.name}<br>
           <a href="/editpoint/${key}">Edit</a> |
           <a href="#" class="delete-link" data-key="${key}">Delete</a>`
        );
      }
    }

    // ✅ event ketika popup marker dibuka
    this.map.on('popupopen', (e) => {
      const popup = e.popup;
      const deleteLink = popup.getElement()?.querySelector('.delete-link');
      if (deleteLink) {
        deleteLink.addEventListener('click', (event) => {
          event.preventDefault();
          const key = (event.target as HTMLElement).dataset['key'];
          if (key) {
            this.confirmDelete(key, popup.getLatLng());
          }
        });
      }
    });
  }

  // ✅ fungsi konfirmasi sebelum hapus
  async confirmDelete(key: string, latLng: L.LatLng | undefined) {
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
            this.deletePoint(key, latLng);
          }
        }
      ]
    });

    await alert.present();
  }

  // ✅ fungsi hapus point di database dan hapus marker dari map
  async deletePoint(key: string, latLng: L.LatLng | undefined) {
    await this.dataService.deletePoint(key);
    if (latLng) {
      this.map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          if (layer.getLatLng().equals(latLng)) {
            this.map.removeLayer(layer);
          }
        }
      });
    }
  }
}

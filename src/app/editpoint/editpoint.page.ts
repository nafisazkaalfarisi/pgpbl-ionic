import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { DataService } from '../data.service';
import * as L from 'leaflet';

// Custom icon
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
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-editpoint',
  templateUrl: './editpoint.page.html',
  styleUrls: ['./editpoint.page.scss'],
  standalone: false,
})
export class EditpointPage {
  map!: L.Map;
  key = '';
  name = '';
  coordinates = '';

  private route = inject(ActivatedRoute);
  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);
  private dataService = inject(DataService);

  constructor() {}

  async ionViewDidEnter() {
    this.key = this.route.snapshot.paramMap.get('key') || '';

    const point: any = await this.dataService.getPoint(this.key);
    if (!point) return;

    this.name = point.name;
    this.coordinates = point.coordinates;

    const coords = point.coordinates.split(',').map((c: string) => parseFloat(c));

    // init map
    this.map = L.map('mapedit').setView(coords as L.LatLngExpression, 13);

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    });
    const esri = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'ESRI' }
    );

    osm.addTo(this.map);
    L.control.layers({ OpenStreetMap: osm, 'Esri World Imagery': esri }).addTo(this.map);

    const marker = L.marker(coords as L.LatLngExpression, { draggable: true }).addTo(this.map);
    marker.bindPopup('Drag marker to change coordinates').openPopup();

    marker.on('dragend', (e) => {
      const latlng = e.target.getLatLng();
      this.coordinates = `${latlng.lat.toFixed(9)},${latlng.lng.toFixed(9)}`;
    });

    // fix map blank/gelap
    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);
  }

  async save() {
    if (this.name && this.coordinates) {
      try {
        await this.dataService.updatePoint(this.key, {
          name: this.name,
          coordinates: this.coordinates,
        });
        this.navCtrl.back();
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

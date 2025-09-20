import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
  standalone: false,
})
export class MapsPage implements OnInit {
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
      });
    }
  }
}

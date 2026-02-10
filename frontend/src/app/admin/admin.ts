import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <--- Importa ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class Admin implements OnInit {
  users: any[] = [];
  loading = false;
  currentAdminId: number | null = null;
  processingUsers = new Set<number>();

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef // <--- Inyéctalo aquí
  ) {}

  ngOnInit(): void {
    this.currentAdminId = this.authService.getCurrentUserId();
    
    // Nos suscribimos a la caché
    this.authService.users$.subscribe(data => {
      this.users = data;
      this.cdr.detectChanges(); // <--- ¡DESPIERTA! Muestra los datos ya
    });

    if (!this.authService.usersLoaded) {
      this.loading = true;
    }
    
    this.authService.getUsers().subscribe({
      next: () => {
        this.loading = false;
        this.cdr.detectChanges(); // <--- Muestra la lista en cuanto llegue
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  isDeleting(userId: number): boolean { return this.processingUsers.has(userId); }

  deleteUser(userId: number) {
    if (this.isDeleting(userId)) return;
    if (userId === this.currentAdminId) {
      alert("¡Ouch! No puedes borrar tu propia cuenta.");
      return;
    }

    if (confirm('¿Seguro que quieres borrar a este ciudadano?')) {
      this.processingUsers.add(userId);
      this.cdr.detectChanges(); // Muestra el estado "Borrando..."

      this.authService.deleteUser(userId).subscribe({
        next: () => {
          this.processingUsers.delete(userId);
          this.cdr.detectChanges(); // Quita la tarjeta de la pantalla inmediatamente
        },
        error: (err) => {
          alert('Error al eliminar: ' + err.message);
          this.processingUsers.delete(userId);
          this.cdr.detectChanges();
        }
      });
    }
  }
}
// import { Component, OnInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { Blog } from '../../models/blog.model';

// @Component({
//   selector: 'app-blog-list',
//   templateUrl: './blog-list.component.html',
//   styleUrls: ['./blog-list.component.scss']
// })
// export class BlogListComponent implements OnInit {
//   blogs: Blog[] = [];

//   constructor(
//     private http: HttpClient,
//     private router: Router
//   ) {}

//   ngOnInit() {
//     this.loadPublishedBlogs();
//   }

//   loadPublishedBlogs() {
//     this.http.get<Blog[]>('http://localhost:3000/blogs').subscribe(
//       (data) => {
//         this.blogs = data.filter(blog => blog.status === 'published');
//       },
//       (error) => {
//         console.error('Erreur lors de la récupération des blogs:', error);
//       }
//     );
//   }
  

//   goToAuthor(authorId: number) {
//     this.router.navigate(['/author', authorId]);
//   }
// }



import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Blog } from '../../models/blog.model';
import { User } from '../../../auth/models/user';
import { ImageHoverService } from '../../../image-hover.service';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.scss']
})
export class BlogListComponent implements OnInit {
  blogs: Blog[] = [];
  users: User[] = []; // Stocke les informations des utilisateurs
  isLoading = true;

  constructor(
    private http: HttpClient, 
    private router: Router,
    private imageHoverService: ImageHoverService
  ) {}

  ngOnInit() {
    this.loadPublishedBlogs();
    this.loadUsers();
  }

  // Récupère les blogs publiés
  // loadPublishedBlogs() {
  //   this.http.get<Blog[]>('http://localhost:3000/blogs').subscribe(
  //     (data) => {
  //       this.blogs = data.filter(blog => blog.status === 'published');
  //     },
  //     (error) => console.error('Erreur lors de la récupération des blogs:', error)
  //   );
  // }
  loadPublishedBlogs() {
    this.isLoading = true;
    this.http.get<Blog[]>('http://localhost:3000/blogs').subscribe(
      (data) => {
        this.blogs = data.filter(blog => blog.status === 'published');
        this.isLoading = false;
      },
      (error) => {
        console.error('Erreur lors de la récupération des blogs:', error);
        this.isLoading = false;
      }
    );
  }
  

  // Récupère la liste des utilisateurs
  loadUsers() {
    this.http.get<User[]>('http://localhost:3000/users').subscribe(
      (data) => {
        this.users = data;
      },
      (error) => console.error('Erreur lors de la récupération des utilisateurs:', error)
    );
  }

  // Retourne l'utilisateur correspondant à un blog
  getUserById(userId: number): User | undefined {
    return this.users.find(user => user.id === userId);
  }

  // Naviguer vers la page de l'auteur
  goToAuthor(authorId: number) {
    this.router.navigate(['/author', authorId]);
  }

  onMouseOver(event: MouseEvent): void {
    const target = event.target as HTMLImageElement; // Assertion de type
    if (target) {
      this.imageHoverService.enlargeImage(target);
    }
  }

  onMouseOut(event: MouseEvent): void {
    const target = event.target as HTMLImageElement; 
    if (target) {
      this.imageHoverService.resetImage(target);
    }
  }
}

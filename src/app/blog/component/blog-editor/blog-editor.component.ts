import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../auth/service/auth.service';
import { User } from '../../../auth/models/user';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Chapter {
  title: string;
  content: string;
}

@Component({
  selector: 'app-blog-editor',
  templateUrl: './blog-editor.component.html',
  styleUrls: ['./blog-editor.component.scss']
})
export class BlogEditorComponent {
  editorContent: string = '';
  coverImageUrl: string = '';  
  coverText: string = '';
  isPreviewVisible: boolean = false;
  isLocalImage: boolean = false; 
  currentUser: User | null = null; 
  maxCoverTextLength: number = 250; 
  chapters: Chapter[] = [{ title: '', content: '' }]; 

  editorModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ direction: 'rtl' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ['clean'],
      ['link', 'image', 'video']
    ]
  };

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {
    this.currentUser = this.authService.getCurrentUser(); 
  }

  getSanitizedContent(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  addChapter() {
    this.chapters.push({ title: '', content: '' }); 
  }

  removeChapter(index: number) {
    if (this.chapters.length > 1) {
      this.chapters.splice(index, 1); 
    }
  }

  togglePreview() {
    this.isPreviewVisible = !this.isPreviewVisible;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.coverImageUrl = e.target.result;  
        this.isLocalImage = true;
      };
      reader.readAsDataURL(file);
    }
  }

  publishBlog() {
    if (!this.coverText || !this.coverImageUrl || this.chapters.length === 0) {
      alert('Veuillez remplir tous les champs avant de publier.');
      return;
    }

    const userId = JSON.parse(localStorage.getItem('currentUser') || '{}').id;
  
    this.http.get<User>(`http://localhost:3000/users/${userId}`).subscribe(
      (user) => {
        const newBlog = {
          coverImageUrl: this.coverImageUrl,
          coverText: this.coverText,
          date: new Date().toISOString(),
          status: 'published',
          userId: user.id,
          author: user.pseudo, // Stockage du pseudo
          chapters: this.chapters, // Ajout des chapitres au blog
          profileImageUrl: user.profile?.imageUrl
        };
  
        this.http.post('http://localhost:3000/blogs', newBlog).subscribe(
          () => {
            alert('Blog publié avec succès !');
            this.resetForm();
          },
          (error) => {
            console.error('Erreur lors de la publication du blog :', error);
            alert('Erreur lors de la publication. Veuillez réessayer.');
          }
        );
      },
      (error) => {
        console.error('Erreur lors de la récupération de l\'utilisateur :', error);
      }
    );
  }  

  saveDraft() {
    if (this.currentUser) {
      const draftBlog = {
        coverImageUrl: this.coverImageUrl,
        coverText: this.coverText,
        date: new Date().toISOString(),
        status: 'draft', 
        userId: this.currentUser.id, 
        author: this.currentUser.firstName + ' ' + this.currentUser.lastName,
        chapters: this.chapters // Ajout des chapitres au brouillon
      };

      this.http.post('http://localhost:3000/blogs', draftBlog).subscribe(
        () => {
          alert('Brouillon enregistré avec succès !');
          this.resetForm();
        },
        (error) => {
          console.error('Erreur lors de l\'enregistrement du brouillon:', error);
        }
      );
    } else {
      alert('Vous devez être connecté pour enregistrer un brouillon.');
    }
  }

  resetForm() {
    this.editorContent = '';
    this.coverImageUrl = '';
    this.coverText = '';
    this.isLocalImage = false;
    this.isPreviewVisible = false;
    this.chapters = [{ title: '', content: '' }]; 
  }
}
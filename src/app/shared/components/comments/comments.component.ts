import { Component, EventEmitter, Input, input, OnInit, Output } from '@angular/core';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from '../../shared.module';
import { animate, animateChild, group, query, sequence, stagger, state, style, transition, trigger, useAnimation } from '@angular/animations';
import { flashAnimation } from '../../animations/flash.animation';
import { slideAndFadeAnimation } from '../../animations/slide-and-fade.animation';
import { Comment } from '../../../models/comment.model';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    DatePipe,
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.scss',
  animations:[
    trigger('list', [
      transition(':enter', [
          query('@listItem', [
              stagger(50, [
                  animateChild()
              ])
          ])
      ])
    ]),
    trigger('listItem', [
      state('default', style({
        transform: 'scale(1)',
        'background-color': 'white',
        'z-index': 1
      })),
      state('active', style({
        transform: 'scale(1.05)',
        'background-color': 'rgb(201, 157, 242)',
        'z-index': 2
      })),
      transition('default => active', [
        animate('100ms ease-in-out')
      ]),
      transition('active => default', [
        animate('500ms ease-in-out')
      ]),
      transition(':enter', [
        query('.comment-text, .comment-date', [
          style({
              opacity: 0
          })
        ]),
        useAnimation(slideAndFadeAnimation, {
          params: {
              time: '500ms',
              startColor: 'rgb(201, 157, 242)'
          }
        }),
        group([
          useAnimation(flashAnimation, {
            params: {
                time: '250ms',
                flashColor: 'rgb(249,179,111)'
            }
          }),
          query('.comment-text', [
              animate('250ms', style({
                  opacity: 1
              }))
          ]),
          query('.comment-date', [
              animate('500ms', style({
                  opacity: 1
              }))
          ]),
        ]),
      ])
    ])
  ]
})
export class CommentsComponent implements OnInit {

  @Input() comments!: Comment[];
  @Output() newComment = new EventEmitter<string>();
  commentCtrl!: FormControl;
  animationStates: { [key: number]: 'default' | 'active' } = {};

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.commentCtrl = this.formBuilder.control('',[Validators.required, Validators.minLength(10)]);
    for (let index in this.comments) {
      this.animationStates[index] = 'default';
    }
  }

  CommentSend(){
   console.log(`commentaire envouyer ${this.comments}`)
  }
  
  onLeaveComment() {
    if (this.commentCtrl.invalid) {
        return;
    }
    const maxId = Math.max(...this.comments.map(comment => comment.id));
    this.comments.unshift({
        id: maxId + 1,
        comment: this.commentCtrl.value,
        createdDate: new Date().toISOString(),
        userId: 1
    });
    this.newComment.emit(this.commentCtrl.value);
    this.commentCtrl.reset();
  }

  onListItemMouseEnter(index: number) {
    this.animationStates[index] = 'active';
  }

  onListItemMouseLeave(index: number) {
    this.animationStates[index] = 'default';
  }
}

import { Component, OnInit, Input } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { take } from 'rxjs/operators';

// Models
import { Period } from '../period';

// Services
import { PeriodsService } from '../periods.service';
import { TimeframeService } from '../../core/services/timeframe.service';

import { Table } from '../../components/table/table';

@Component({
  moduleId: module.id,
  selector: 'periods-table',
  templateUrl: './periods-table.component.html',
  styleUrls: ['./periods-table.component.css'],
})

export class PeriodsTableComponent extends Table implements OnInit {

  @Input() periods: ReplaySubject<Array<Period>>;

  public rows = [
    this.name_row,
    this.comment_row,
    {
      title: 'Start date',
      value: function(p) { return p.start_date; },
    },
    {
      title: 'End date',
      value: function(p) { return p.end_date; },
    },
    {
      title: 'Budget',
      value: function(p) { return p.budget.name + ' (' + p.budget.currency.name + ')'; },
      routerLink: function(c) { return ['/budgets', c.id] },
    },
    ...this.balances_rows,
  ];

  public card_title = function(b) { return b.name; }

  public card_subtitle = function(b) { return b.comment; }

  public cards = [
    {
      title: 'Start date',
      value: function(p) { return p.start_date; },
    },
    {
      title: 'End date',
      value: function(p) { return p.end_date; },
    },
    {
      title: 'Budget',
      value: function(p) { return p.budget.name + ' (' + p.budget.currency.name + ')'; },
      routerLink: function(c) { return ['/budgets', c.id] },
    },
    ...this.balances_rows,
  ];

  public actions = [
    {
      title: function(b) { return this.timeframeService.isCurrentPeriod(b) ? 'Deselect' : 'Select' }.bind(this),
      icon: 'check',
      click: function(b) { return this.timeframeService.isCurrentPeriod(b) ? this.timeframeService.selectPeriod() : this.timeframeService.selectPeriod(b) }.bind(this),
      ngClass: function(b) { return {'text-success': true}; },
    },
    {
      title: function(b) { return b.end_date ? 'Reopen' : 'Close' }.bind(this),
      icon: 'times',
      click: this.close_or_reopen.bind(this),
      ngClass: function(b) { return {'text-warning': true}; },
    },
    {
      title: 'Cycle',
      icon: 'retweet',
      disabled: function(b) { return b.end_date; },
      click: this.cycle.bind(this),
      ngClass: function(b) { return {'text-info': true}; },
    },
    {
      title: 'Edit',
      icon: 'edit',
      ngClass: function(b) { return {'text-primary': true}; },
      routerLink: function(b) { return ['/periods', b.id, 'edit']; },
    },
    {
      title: 'Delete',
      icon: 'trash-alt',
      ngClass: function(b) { return {'text-danger': true}; },
      click: this.delete.bind(this),
    }
  ];

  constructor(
    public periodsService: PeriodsService,
    public timeframeService: TimeframeService,
  ) {
    super();
    this.objectsService = periodsService;
    this.path = '/periods';
  }

  ngOnInit() {
    this.objects = this.periods;
  }

  close_or_reopen(period: Period) {
    (period.end_date ? this.timeframeService.reopenPeriod(period) : this.timeframeService.closePeriod(period)).subscribe(
      data => {
        this.periods.pipe(take(1)).subscribe(
          periods => {
            const index = periods.findIndex(function (x) { return x.id == this.id }, period);
            periods[index] = data;
            this.periods.next(periods);
          }
        );
      }
    );
  }

  cycle(period: Period) {
    this.timeframeService.cyclePeriod(period).subscribe(
      data => {
        this.periods.pipe(take(1)).subscribe(
          periods => {
            const index = periods.findIndex(function (x) { return x.id == this.id }, period);
            periods.splice(index, 1);
            this.periods.next([...data, ...periods]);
          }
        );
      }
    );
  }

  active_row(b) {
    return this.timeframeService.isCurrentPeriod(b);
  }
}

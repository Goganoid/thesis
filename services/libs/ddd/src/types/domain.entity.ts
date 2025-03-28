export interface PersitenceEntity<Id = string> {
  id?: Id;
}

export class DomainEntity<Event, Entity extends PersitenceEntity> {
  protected entity: Entity;
  protected events: Event[] = [];

  constructor(entity: Entity, events?: Event[]) {
    this.entity = entity;
    if (events) {
      this.events = events;
    }
  }

  getEvents() {
    return this.events;
  }
}

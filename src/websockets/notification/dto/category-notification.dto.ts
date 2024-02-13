export class CategoryNotificationDto {
  constructor(
    public id: string,
    public nameCategory: string,
    public isDeleted: boolean,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}

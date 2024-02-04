export class UserResponseDto {
  id: number
  name: string
  lastname: string
  email: string
  username: string
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
  rols: string[]
}

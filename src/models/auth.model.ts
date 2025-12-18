import fs from 'fs-extra'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const dbPath = path.join(process.cwd(), 'db.json')

interface User {
  id: string
  fullname: string
  email: string
  username: string
  password: string
  license: string
  expire: number
}

class AuthModel {
  private readDB() {
    return fs.readJSONSync(dbPath)
  }

  private writeDB(data: any) {
    fs.writeJSONSync(dbPath, data, { spaces: 2 })
  }

  findUserByUsername(username: string) {
    const db = this.readDB()
    return db.users.find((u: User) => u.username === username)
  }

  findUserByEmail(email: string) {
    const db = this.readDB()
    return db.users.find((u: User) => u.email === email)
  }

  createUser(data: Omit<User, 'id'>) {
    const db = this.readDB()
    const newUser = { id: uuidv4(), ...data }
    db.users.push(newUser)
    this.writeDB(db)
    return newUser
  }

  resetPassword(username: string, newPassword: string) {
    const db = this.readDB()
    db.users = db.users.map((u: User) => (u.username === username ? { ...u, password: newPassword } : u))
    this.writeDB(db)
  }

  updateUser(username: string, newData: Partial<User>) {
    const db = this.readDB()
    const index = db.users.findIndex((u: User) => u.username === username)

    if (index === -1) return null

    db.users[index] = {
      ...db.users[index],
      ...newData
    }

    this.writeDB(db)
    return db.users[index]
  }
}

export const authModel = new AuthModel()

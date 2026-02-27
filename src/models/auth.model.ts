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

  ////  
  findUserByLicense(license: string) {
    const db = this.readDB()
    
    // 1. Log Input đầu vào
    console.log('\n--- [DEBUG START] ---')
    console.log('1. Raw Input:', license)
    
    const cleanInput = license.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    console.log('2. Clean Input:', cleanInput)

    const foundUser = db.users.find((u: User) => {
      if (!u.license) return false

      // 3. Log từng dòng trong DB khi quét qua
      const cleanDB = u.license.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
      
      // In ra để so sánh (Chỉ in khi gần giống để đỡ spam log, hoặc in hết nếu cần)
      // Ở đây tôi in hết để bạn dễ soi
      console.log(`   > Comparing with DB User: ${u.username}`)
      console.log(`     - DB Raw:   "${u.license}"`)
      console.log(`     - DB Clean: "${cleanDB}"`)
      console.log(`     - Match?:   ${cleanDB === cleanInput}`)

      return cleanDB === cleanInput
    })

    if (foundUser) {
        console.log(' FOUND USER:', foundUser.username)
    } else {
        console.log(' NO MATCH FOUND')
    }
    console.log('--- [DEBUG END] ---\n')

    return foundUser
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

import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "src/auth/dto";

import * as pactum from 'pactum'
import { EditUserDto } from "src/user/dto";
import { CreateBookmarkDto, EditBookmarkDto } from "src/bookmark/dto";

describe('APP e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true, // receive on body only inputs determinated in the dto 
    }));
    await app.init;
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3333')
  });

  afterAll(async () => {
    await app.close();

  });

  describe('Auth', () => {
    const dto: AuthDto  = {
      email: 'lucas@gmail.com',
      password: '123'
    }
    
    describe('Signup', () => {
      it('should signup', () => {
        return pactum.spec()
        .post('/auth/signup')
        .withBody(dto)
        .expectStatus(201);
      });

      it('should throw if email empty', () => {
        return pactum.spec()
        .post('/auth/signup')
        .withBody({
          password: dto.password
        })
        .expectStatus(400);
      });

      it('should throw if password empty', () => {
        return pactum.spec()
        .post('/auth/signup')
        .withBody({
          email: dto.email
        })
        .expectStatus(400);
      });

      it('should throw if no body provided', () => {
        return pactum.spec()
        .post('/auth/signup')
        .expectStatus(400);
      });
    });
  
    describe('Signin', () => {
      it('should signin', () => {
        return pactum.spec()
        .post('/auth/signin')
        .withBody(dto)
        .expectStatus(200)
        .stores('userAt', 'access_token');
      });

      it('should throw if email empty', () => {
        return pactum.spec()
        .post('/auth/signin')
        .withBody({
          password: dto.password
        })
        .expectStatus(400);
      });

      it('should throw if password empty', () => {
        return pactum.spec()
        .post('/auth/signin')
        .withBody({
          email: dto.email
        })
        .expectStatus(400);
      });

      it('should throw if no body provided', () => {
        return pactum.spec()
        .post('/auth/signin')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}'
        })
        .expectStatus(400);
      });
    });
  });
  
  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
        .spec()
        .get('users/me')
        .expectStatus(200)
      });
    });

    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          firstName: "Lucas",
          email:"lucas@coy.com"
        }
        return pactum
        .spec()
        .patch('users')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}'
        })
        .withBody(dto)
        .expectStatus(200)
        .expectBodyContains(dto.firstName)
        .expectBodyContains(dto.email)
      });
    });
  });
  
  
  describe('Bookmarks', () => {   
    describe('Create Bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: "First bookmark",
        link: "bookmark.com"
      }
      it("should create bookmarks", () => {
        return pactum
        .spec()
        .post('/bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}'
        })
        .withBody(dto)
        .expectStatus(201)
        .stores('bookmarkId', 'id')
      });
    });  

    describe('Get Bookmarks', () => {
      it("should get bookmarks", () => {
        return pactum
        .spec()
        .get('/bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}'
        })
        .expectStatus(200)
        .expectJsonLength(1)
      });
    });

    describe('Get Bookmark by id', () => {
      it("should get bookmark by id", () => {
        return pactum
        .spec()
        .get('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}'
        })
        .expectStatus(200)
        .expectBodyContains('$S{bookmarkId}')
      });
    });

    describe('Edit Bookmark by id', () => {
      const dto: EditBookmarkDto = {
        title: 'The guy who try programming',
        description: 'Where am i?'
      }
      it("should edit bookmark", () => {
        return pactum
        .spec()
        .patch('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withBody(dto)
        .withHeaders({
          Authorization: 'Bearer $S{userAt}'
        })
        .expectStatus(200)
        .expectBodyContains(dto.title)
        .expectBodyContains(dto.description)
      });
    });

    describe('Delete Bookmark by id', () => {
      it("should delete bookmark", () => {
        return pactum
        .spec()
        .delete('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}'
        })
        .expectStatus(204)
      });
    });

    describe('Get empty Bookmarks', () => {
      it("should get bookmarks", () => {
        return pactum
        .spec()
        .get('/bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}'
        })
        .expectStatus(200)
        .expectJsonLength(1)
      });
    });
  });
});

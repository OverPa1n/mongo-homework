'use strict'

const {mapUser, getRandomFirstName, mapArticles} = require('./util')

// db connection and settings
const connection = require('./config/connection')
let userCollection
let articlesCollection
let studentsCollection
// run()
// makeArticlesCollection()
makeStudentsCollection()
// async function run() {
//   await connection.connect()
//   // await connection.get().createCollection('users')
//   await connection.get().dropCollection('users')
//   userCollection = connection.get().collection('users')
//
//   await example1()
//   await example2()
//   await example3()
//   await example4()
//   await connection.close()
// }


// #### Users

// // - Create 2 users per department (a, b, c)
// async function example1() {
// try {
//   const departments = ['a','a', 'b','b','c','c']
//   const users = departments.map(d => ({department: d})).map(mapUser)
//
//   console.log(users)
//   try {
//
//     const {result} = await userCollection.insertMany(users)
//     console.log(`Added ${result.n} users`)
//   } catch (err) {
//     console.error(err)
//   }
// } catch (e) {
//   console.log(e)
// }
//
//
// }
//
// // // - Delete 1 user from department (a)
// //
// async function example2() {
//   try {
//   const deleteUser = await userCollection.deleteOne({department: 'a'})
//   } catch (err) {
//     console.error(err)
//   }
// }
//
// // // - Update firstName for users from department (b)
// //
// async function example3() {
//   try {
//     const updateUser = await userCollection.updateMany({department: 'b'}, {$set: {"firstName": 'User from department b'}})
//     console.log(updateUser.modifiedCount)
//   } catch (err) {
//     console.error(err)
//   }
// }
//
// // // - Find all users from department (c)
// async function example4() {
//   try {
//   const allUsers = await userCollection.find({department: 'c'}).toArray()
//     console.log(allUsers)
//   } catch (err) {
//     console.error(err)
//   }
// }


//### Articles
async function makeArticlesCollection() {
    await connection.connect()
    // await connection.get().createCollection('articles')
    await connection.get().dropCollection('articles')
    articlesCollection = connection.get().collection('articles')

    await createArticles()
    await findArticles()
    await updateTags()
    await findArticlesWithCondition()
    await pullArticles()
    await connection.close()
}

function generateType() {
    let type = []
    for (let i = 1; i <= 25; i++) {
        switch (true) {
            case i > 0 && i <= 5:
                type.push('a')
                break;
            case i > 5 && i <= 10:
                type.push('b')
                break;
            case i > 10 && i <= 15:
                type.push('c')
                break;
            case i > 15 && i <= 20:
                type.push('d')
                break;
            case i > 20 && i <= 25:
                type.push('e')
                break;
        }
    }
    return type
}

// // - Create 5 articles per each type (a, b, c)
async function createArticles() {
    try {
        let type = await generateType()
        const articles = type.map(t => ({type: t})).map(mapArticles)
        const result = await articlesCollection.insertMany(articles)
        console.log(result.insertedCount)
    } catch (e) {
        console.log(e)
    }
}

// // - Find articles with type a, and update tag list with next value [‘tag1-a’, ‘tag2-a’, ‘tag3’]
async function findArticles() {
    try {
        const updateArticles = await articlesCollection.updateMany({type: 'a'}, {$set: {tags: ['tag1-a', 'tag2-a', 'tag3']}})
        console.log(updateArticles.modifiedCount)
    } catch (e) {
        console.log(e)
    }
}

// // - Add tags [‘tag2’, ‘tag3’, ‘super’] to other articles except articles from type a
async function updateTags() {
    try {
        const addTags = await articlesCollection.updateMany({type: {$ne: "a"}}, {$set: {tags: ['tag2', 'tag3', 'super']}})
        console.log(addTags.modifiedCount)
    } catch (e) {
        console.log(e)
    }
}

// // - Find all articles that contains tags [tag2, tag1-a]
async function findArticlesWithCondition() {
    try {
        const findTags = await articlesCollection.find({tags: {$in: ['tag2', 'tag1-a']}}).toArray()
        console.log(findTags)
    } catch (e) {
        console.log(e)
    }
}

// - Pull [tag2, tag1-a] from all articles
async function pullArticles() {
    try {
        const pullTags = await articlesCollection.updateMany({}, {$pull: {tags: {$in: ["tag2", "tag1-a"]}}})
        console.log(pullTags.modifiedCount)
    } catch (e) {
        console.log(e)
    }
}

//-------------------------------------------------------------------

// ### Students

async function makeStudentsCollection() {
    await connection.connect()
    // await connection.get().createCollection('students')
    // await connection.get().dropCollection('students')
    studentsCollection = connection.get().collection('students')

    await getWorstScore()
    await getBestAndWorstScore()
    await getBestScope()
    await calcAverageScore()
    await deleteStudents()
    await setMarks()
    await getAverageForAllStudents()
    await connection.close()
}

// - Find all students who have the worst score for homework, sort by descent
async function getWorstScore() {
    try {
        const result = await studentsCollection.aggregate([
            {$unwind: "$scores"},
            {$match: {'scores.type': 'homework'}},
            {$match: {'scores.score': {$lt: 65}}},
            {$group: {_id: {name: '$name', scores: '$scores'}}},
            {$sort: {'_id.scores': -1}}


        ]).toArray()
        // console.log(result)
    } catch (e) {
        console.log(e)
    }
}

// - Find all students who have the best score for quiz and the worst for homework, sort by ascending
async function getBestAndWorstScore() {
    try {
        const result = await studentsCollection.aggregate([
            {$match: {scores: {$elemMatch: {type: 'quiz', score: {$gte: 90}}}}},
            {$match: {scores: {$elemMatch: {type: 'homework', score: {$lte: 65}}}}},
            {$group: {_id: {name: '$name', score: '$scores'}}},
            {$sort: {score: 1}}

        ]).toArray()
        // console.log(result)
    } catch (e) {
        console.log(e)
    }
}

// - Find all students who have best scope for quiz and exam
async function getBestScope() {
    try {
        const result = await studentsCollection.aggregate([
            {$match: {scores: {$elemMatch: {type: 'quiz', score: {$gte: 90}}}}},
            {$match: {scores: {$elemMatch: {type: 'exam', score: {$gte: 90}}}}},
            {$group: {_id: {name: '$name', scores: '$scores'}}},

        ]).toArray()
        // console.log(result)
    } catch (e) {
        console.log(e)
    }
}

// - Calculate the average score for homework for all students
async function calcAverageScore() {
    try {
        const result = await studentsCollection.aggregate([
            {$unwind: "$scores"},
            {$match: {'scores.type': 'homework'}},
            {$group: {_id: '$name', avgScore: {$avg: '$scores.score'}, amountOfStudents: {$sum: 1}}},

        ]).toArray()
        // console.log(result)
    } catch (e) {
        console.log(e)
    }
}

// - Delete all students that have homework score <= 60
async function deleteStudents() {
    try {
        const result = await studentsCollection.deleteMany({
            scores: {$elemMatch: {type: 'homework', score: {$lte: 60}}}
        })

    } catch (e) {
        console.log(e)
    }
}

// - Mark students that have quiz score => 80
async function setMarks() {
    try {
        const result = await studentsCollection.updateMany({
            scores: {$elemMatch: {type: 'quiz', score: {$gte: 80}}}
        }, {
            $set: {'mark': 'c'}
        })

    } catch (e) {
        console.log(e)
    }
}

// - Write a query that group students by 3 categories (calculate the average grade for three subjects)
// - a => (between 0 and 40)
// - b => (between 40 and 60)
// - c => (between 60 and 100)

async function getAverageForAllStudents() {
    try {
        const result = await studentsCollection.aggregate([
            {$match: {}},
            {$group: {_id: {name: '$name', score: '$scores', avgScore: {$avg: '$scores.score'}}}},

        ]).toArray()
    } catch (e) {
        console.log(e)
    }
}

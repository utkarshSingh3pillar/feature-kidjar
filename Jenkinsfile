pipeline {
    agent any
    environment {
        registry = "710866754724.dkr.ecr.us-east-1.amazonaws.com/poc-1"
    }
   
    stages {
         // Building Docker images
    stage('Building image') {
      steps{
        script {
          dockerImage = docker.build registry
        }
      }
    }
   stage('Pushing to ECR') {
     steps{  
         script {
                sh 'aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 710866754724.dkr.ecr.us-east-1.amazonaws.com'
                sh 'docker push 710866754724.dkr.ecr.us-east-1.amazonaws.com/poc-1:latest'
         }
        }
      }
    }
}
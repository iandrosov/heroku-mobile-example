@RestResource(urlMapping='/jobs/*') 
global class SECHIJobService {

  // Wrapper class records
  global class JobWrapper {
        global List<SVC_Job__c> jobs {get; set;}
        
  }
        
  @HttpGet
  global static void doGet() {
      List<SVC_Job__c> lst = [SELECT Id, Name, Client_Contact__c,Client_Name__c,
          Contact_Name__c, Info_Text__c, Job_Address__c,Job_End_Time__c,Job_Name__c,Job_Start_Time__c,
          Latitude__c,Longitude__c,Notes__c,Phone__c,Picture_S3_URL__c,Picture_S3_URL_1__c,Picture_S3_URL_2__c,
          Status__c  
           FROM SVC_Job__c];
      JobWrapper job = new JobWrapper();
      job.jobs = lst;
      
    RestContext.response.addHeader('Content-Type', 'application/json');
    // Return a list jobs JSON as an example
    RestContext.response.responseBody = 
        Blob.valueOf(JSON.serialize(job));
              
  }
}
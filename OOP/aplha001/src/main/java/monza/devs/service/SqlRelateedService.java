package monza.devs.service;

import org.springframework.stereotype.Service;

@Service
public class SqlRelateedService {

    private final LLMService llmService;

    public SqlRelateedService(LLMService llmService) {
        this.llmService = llmService;
    }

    // 🧠 Generate SQL using LLM (replace mock with actual LLM call)
    public String generateSql(String MODEL, String OLLAMA_API_URL, String naturalLanguageQuery) {

        String schemaPrompt = """
                You are provided with a database that contains a table named `employees` with the following columns:

                - `id` (INT, Primary Key, Auto Increment)
                - `name` (VARCHAR): The name of the employee
                - `department` (VARCHAR): The department the employee belongs to
                - `join_date` (DATE): The date the employee joined the company
                - `salary` (INT): The employee's annual salary in USD
                - `age` (INT): The age of the employee in years
                - `gender` (VARCHAR): The gender of the employee (e.g., Male/Female/Other)
                - `nationality` (VARCHAR): The nationality of the employee
                - `canteen_money` (INT): The amount of money allocated for the employee's canteen expenses

                Generate a valid SINGLE LINE SQL query based on the following natural language request
                and just say the sql query without any explanation or additional text:
                dont display their age, joindate, age, gender, nationality, canteen_money unless the user explicitly asks for more columns.
                Just say the SQL query without any explanation or additional text.
                """.stripIndent() + naturalLanguageQuery + """
                """;

        String fullPrompt = schemaPrompt + naturalLanguageQuery;

        return llmService.getOllamaResponse(MODEL, OLLAMA_API_URL, fullPrompt);
    }

    public String explainSQL(String MODEL, String OLLAMA_API_URL, String userprompt, String query, String sql_output) {

        String fullPrompt = """
            You are a helpful assistant. Your job is to answer the user's question clearly and simply using the information provided below.
        
            The user asked:
            "%s"
        
            Here is the information you can use:
            ```json
            %s
            ```
        
            Answer the question in plain, conversational language. Do not mention where the information came from or how it was retrieved. Just respond as if you already knew the answer.
            """.formatted(userprompt, sql_output);
        
        return llmService.getOllamaResponse(MODEL, OLLAMA_API_URL, fullPrompt);
    }

}

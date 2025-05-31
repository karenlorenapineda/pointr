package com.example.pointr

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import com.android.volley.Request
import com.android.volley.toolbox.JsonArrayRequest
import com.android.volley.toolbox.JsonObjectRequest
import com.android.volley.toolbox.Volley
import org.json.JSONObject

class MainActivity : ComponentActivity() {
    /**
     * Si estás ejecutando el backend en el emulador,
     * usa "http://10.0.2.2:3000/messages".
     * Si despliegas tu backend a Render/Railway, pon aquí la URL pública,
     * por ejemplo "https://miapi-ejemplo.onrender.com/messages".
     */
    private val apiUrl = "http://10.0.2.2:3000/messages"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            MyApp(apiUrl)
        }
    }
}

/**
 * Interfaz con Compose que:
 * 1) Muestra un campo para escribir un mensaje
 * 2) Botón "Enviar" que hace POST a /messages
 * 3) Lista de mensajes obtenidos de GET /messages
 */
@Composable
fun MyApp(apiUrl: String) {
    val context = LocalContext.current
    // Instancia del RequestQueue de Volley
    val queue = remember { Volley.newRequestQueue(context) }

    // Estado para el texto de entrada y lista de mensajes
    var inputText by remember { mutableStateOf(TextFieldValue("")) }
    var messages by remember { mutableStateOf(listOf<String>()) }

    // Al iniciarse la composición, llamamos a fetchMessages(...) para obtener los mensajes
    LaunchedEffect(Unit) {
        fetchMessages(apiUrl, queue) { result ->
            messages = result
        }
    }

    Scaffold(modifier = Modifier.fillMaxSize()) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .padding(24.dp)
        ) {
            // Campo de texto para escribir un mensaje
            OutlinedTextField(
                value = inputText,
                onValueChange = { inputText = it },
                label = { Text("Escribe un mensaje") },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(16.dp))

            // Botón "Enviar"
            Button(onClick = {
                if (inputText.text.isNotBlank()) {
                    // Crear objeto JSON { "text": "el mensaje" }
                    val json = JSONObject().apply {
                        put("text", inputText.text)
                    }
                    // Petición POST con JsonObjectRequest
                    val postRequest = JsonObjectRequest(
                        Request.Method.POST,
                        apiUrl,
                        json,
                        { response ->
                            Toast.makeText(context, "Mensaje enviado", Toast.LENGTH_SHORT).show()
                            inputText = TextFieldValue("") // limpiar campo
                            // Refrescar la lista de mensajes
                            fetchMessages(apiUrl, queue) { result ->
                                messages = result
                            }
                        },
                        { error ->
                            Toast.makeText(context, "Error al enviar", Toast.LENGTH_SHORT).show()
                            error.printStackTrace()
                        }
                    )
                    queue.add(postRequest)
                } else {
                    Toast.makeText(context, "Escribe algo primero", Toast.LENGTH_SHORT).show()
                }
            }) {
                Text("Enviar")
            }

            Spacer(Modifier.height(24.dp))

            Text("Mensajes:", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(8.dp))

            // Mostrar cada mensaje en un Text
            messages.forEach { msg ->
                Text("- $msg")
            }
        }
    }
}

/**
 * Función que hace GET a /messages y devuelve la lista de strings (textos)
 */
fun fetchMessages(
    apiUrl: String,
    queue: com.android.volley.RequestQueue,
    onResult: (List<String>) -> Unit
) {
    val getRequest = JsonArrayRequest(
        Request.Method.GET,
        apiUrl,
        null,
        { response ->
            val results = mutableListOf<String>()
            for (i in 0 until response.length()) {
                val text = response.getJSONObject(i).getString("text")
                results.add(text)
            }
            onResult(results)
        },
        { error ->
            error.printStackTrace()
        }
    )
    queue.add(getRequest)
}

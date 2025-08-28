# Observações e Plano de Correção de Código

Este arquivo detalha as correções necessárias no código para alinhar o aplicativo com os assets (imagens e áudio) que serão fornecidos, conforme descrito no `README.md`.

---

## 1. Correções para Imagens 🖼️
**Status: Concluído (Fase 2)**

A lógica principal para carregar imagens já existe, mas os dados no `script.js` estão inconsistentes e incompletos.

### Ações Necessárias:

#### a. Expandir Dados de Vocabulário

A variável `vocabularyData` em `script.js` deve ser atualizada para incluir todos os 8 países.

**Código a ser substituído em `script.js`:**

```javascript
// Substituir o array this.vocabularyData existente por este:
this.vocabularyData = [
    { country: 'Brazil', correct: 'Brazilian', image: 'images/flags/flag-brazil.png' },
    { country: 'USA', correct: 'American', image: 'images/flags/flag-usa.png' },
    { country: 'Japan', correct: 'Japanese', image: 'images/flags/flag-japan.png' },
    { country: 'Italy', correct: 'Italian', image: 'images/flags/flag-italy.png' },
    { country: 'Spain', correct: 'Spanish', image: 'images/flags/flag-spain.png' },
    { country: 'France', correct: 'French', image: 'images/flags/flag-france.png' },
    { country: 'Germany', correct: 'German', image: 'images/flags/flag-germany.png' },
    { country: 'Turkey', correct: 'Turkish', image: 'images/flags/flag-turkey.png' }
];
```

#### b. Corrigir Nomes de Personagens

O `README.md` especifica `character-ana.png`, mas o código pode estar usando um nome diferente (ex: `character-guide.png` em alguns contextos). É preciso garantir que os dados em `conversationData` no `script.js` usem os nomes de arquivo corretos que serão fornecidos.

---

## 2. Correções para Áudio 🔊
**Status: Concluído (Fase 2)**

O sistema de áudio precisa de uma **refatoração completa**, pois a implementação atual (Web Audio API) é incompatível com o requisito de usar arquivos `.mp3`.

### Ações Necessárias:

#### a. Reescrever a Classe `MediaManager`

A classe `MediaManager` em `script.js` deve ser modificada para carregar e reproduzir arquivos de áudio em vez de gerá-los programaticamente.

**Código de substituição sugerido para a classe `MediaManager` em `script.js`:**

```javascript
class MediaManager {
    constructor() {
        this.sounds = {};
        this.isAudioInitialized = false;
        // Pré-carrega os sons para garantir que estejam prontos quando forem tocados.
        this.initAudio();
    }

    initAudio() {
        if (this.isAudioInitialized) return;
        
        try {
            // Define os caminhos para os arquivos de áudio
            const audioFiles = {
                'correct': 'audio/correct-answer.mp3',
                'incorrect': 'audio/incorrect-answer.mp3',
                'badge': 'audio/badge-unlocked.mp3'
            };

            // Cria um objeto Audio para cada som e o armazena
            for (const key in audioFiles) {
                this.sounds[key] = new Audio(audioFiles[key]);
                this.sounds[key].preload = 'auto';
            }
            
            this.isAudioInitialized = true;
            console.log("Audio files preloaded.");

        } catch (e) {
            console.error("Could not initialize or preload audio files.", e);
            this.isAudioInitialized = false;
        }
    }

    playSound(soundName) {
        if (!this.isAudioInitialized || !this.sounds[soundName]) {
            console.warn(`Sound "'${soundName}'" not loaded or found.`);
            return;
        }
        
        // Garante que o som toque desde o início se já estiver tocando
        this.sounds[soundName].currentTime = 0;
        this.sounds[soundName].play().catch(error => console.error(`Error playing sound: ${soundName}`, error));
    }
}
```

#### b. Integrar o Som de Medalha

A função `showBadgeNotification` no `script.js` deve ser atualizada para tocar o som de medalha desbloqueada.

**Modificação em `showBadgeNotification`:**

```javascript
// Dentro da classe LearningApp, encontre a função showBadgeNotification
showBadgeNotification(badge) {
    // Adicionar esta linha para tocar o som
    this.mediaManager.playSound('badge'); 
    
    alert(`Congratulations! You've earned a new badge: ${badge.name}`);
    console.log(`Badge earned: ${badge.name} - ${badge.description}`);
}
```
---

## 3. Correções de Robustez do Código 🛡️
**Status: Concluído (Fase 1)**

Esta seção cobre melhorias para tornar o aplicativo mais resiliente a erros.

### Ação Necessária:

#### a. Proteger Carregamento de Estado (localStorage)

A função `loadState` em `script.js` deve ser protegida com um bloco `try-catch` para evitar que dados corrompidos no `localStorage` travem o aplicativo.

**Código de substituição sugerido para a função `loadState` em `script.js`:**

```javascript
// Em script.js, substitua a função loadState existente por esta:
loadState() {
    try {
        const savedState = localStorage.getItem('learningAppState');
        if (savedState) {
            this.state = JSON.parse(savedState);
            console.log("State loaded.");
        }
    } catch (e) {
        console.error("Could not load or parse state from localStorage. Starting fresh.", e);
    }
}
```
---

## 4. Correções de Estilo (CSS) 🎨
**Status: Concluído (Fase 1)**

Esta seção detalha as ações necessárias para corrigir problemas no arquivo `styles.css`.

### Ação Necessária:

#### a. Remover Código Duplicado

O arquivo `styles.css` atualmente contém todo o seu conteúdo duplicado, resultando em um arquivo com o dobro do tamanho necessário e dificultando a manutenção.

A ação consiste em **remover a segunda metade do arquivo**, que é uma cópia exata da primeira, mantendo apenas uma versão de cada regra de estilo.
---

## 5. Implementação do Mapa Mundial (Fase 4) 🗺️
**Status: Pendente**

Esta seção detalha o plano para implementar a interface da aba "World Map".

### Ação Necessária:

#### a. Lógica de Renderização do Mapa (script.js)
A ser criada uma nova função `renderWorldMapTab` que irá gerar dinamicamente o conteúdo da aba. O "mapa" será um container com elementos `div` representando cada país do `vocabularyData`. Cada `div` será clicável e terá um estilo que reflete se o país já foi "concluído" pelo usuário.

#### b. Estilos do Mapa (styles.css)
A serem adicionados novos estilos para o container do mapa (`.world-map-container`) e para os itens de país (`.country-item`), incluindo estados para "concluído" e "hover", criando uma experiência interativa e visualmente agradável.
import cv2
import os
import shutil
import glob

# ==========================================
# CONFIGURATION
# ==========================================
# Mettez toutes vos photos brutes issues de l'appareil dans ce dossier
INPUT_DIR = "photos_a_trier"  
# C'est ici que les photos renommées apparaîtront
OUTPUT_DIR = "Livrables"      

def setup_directories():
    """Vérifie si les dossiers existent, sinon les crée."""
    created_input = False
    
    if not os.path.exists(INPUT_DIR):
        os.makedirs(INPUT_DIR)
        print(f"📁 J'ai créé le dossier d'entrée : '{INPUT_DIR}'")
        created_input = True
        
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"📁 J'ai créé le dossier de sortie : '{OUTPUT_DIR}'")
        
    if created_input:
        print(f"\n⚠️ STOP: Veuillez placer toutes vos photos (.jpg) du shooting dans le dossier '{INPUT_DIR}', puis relancez ce script.")
        return False
        
    return True

def extract_qr_text(image_path):
    """Ouvre l'image et cherche un QR code. Retourne le texte lu, ou None."""
    # cv2 lit l'image
    img = cv2.imread(image_path)
    if img is None:
        return None
    
    # cv2 décode les QR codes présents
    detector = cv2.QRCodeDetector()
    try:
        data, bbox, _ = detector.detectAndDecode(img)
        if data:
            return data.strip()
    except Exception as e:
        pass
        
    return None

def process_photos():
    """Fonction principale de tri et de renommage."""
    print("==================================================")
    print("🤖 Assistant de Tri Auto par QR Code - Europ Assistance")
    print("==================================================\n")
    
    if not setup_directories():
        return

    # Chercher toutes les photos JPEG
    print(f"🔍 Recherche des photos dans '{INPUT_DIR}'...")
    extensions = ('*.jpg', '*.jpeg', '*.JPG', '*.JPEG')
    photo_paths = []
    
    for ext in extensions:
        photo_paths.extend(glob.glob(os.path.join(INPUT_DIR, ext)))
        
    # TRÈS IMPORTANT : Trier les photos par ordre chronologique ou alphabétique
    # Cela garantit qu'on lit les photos dans le même ordre que la prise de vue
    photo_paths.sort()  
    
    if not photo_paths:
        print(f"\n❌ Aucune photo trouvée dans '{INPUT_DIR}'.")
        print(f"👉 Mettez vos photos dans le dossier '{INPUT_DIR}' et relancez le script.")
        return

    print(f"📸 {len(photo_paths)} photos trouvées. Démarrage du tri...\n")
    
    current_person_name = "INCONNU_SANS_QR"
    photo_counter = 1
    photos_renamed = 0

    # Analyser chaque photo
    for path in photo_paths:
        original_filename = os.path.basename(path)
        
        # 1. Est-ce qu'il y a un QR Code sur cette photo ?
        qr_data = extract_qr_text(path)
        
        if qr_data:
            # 🟢 OUI : C'est la première photo d'une nouvelle personne !
            current_person_name = qr_data
            photo_counter = 1  # On réinitialise le compteur
            print(f"\n🎯 NOUVEAU BADGE DÉTECTÉ : {current_person_name}")
            
            # Note : On ne copie pas la photo du QR Code dans les livrables par défaut.
            # Si vous voulez la copier, commentez la ligne suivante et décommentez le bloc "Sinon"
            continue 
            
        else:
            # ⚪️ NON : C'est une vraie photo de portrait de la personne en cours
            
            # Format du nom final : Nom_Prenom_date-1.jpg
            new_filename = f"{current_person_name}-{photo_counter}.jpg"
            output_path = os.path.join(OUTPUT_DIR, new_filename)
            
            # Copier la photo vers le nouveau dossier avec le nouveau nom
            shutil.copy2(path, output_path)
            
            print(f"  └─ Portrait sauvegardé : {new_filename}")
            
            photo_counter += 1
            photos_renamed += 1

    print("\n==================================================")
    print("🎉 TERMINÉ !")
    if photos_renamed > 0:
        print(f"✅ {photos_renamed} portraits ont été automatiquement triés et renommés !")
        print(f"👉 Allez dans le dossier '{OUTPUT_DIR}' pour voir le résultat.")
        if current_person_name == "INCONNU_SANS_QR":
            print("\n⚠️ Note : Certaines photos ont été rangées dans 'INCONNU_SANS_QR'")
            print("Cela arrive si vos premières photos de la journée n'avaient pas de QR code.")
    else:
        print("❌ Aucune photo de portrait n'a été copiée.")

if __name__ == "__main__":
    process_photos()

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import {Colors} from '../constants/Colors';
import PageTemplate from './PageTemplate';
// Note: Image picker would be implemented with actual expo package
// import * as ImagePicker from 'expo-image-picker';

interface ContentElement {
  id: string;
  type: 'banner' | 'carousel' | 'homescreen';
  name: string;
  currentImage?: string;
  currentText?: string;
}

interface ContentManagementPageProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onBack?: () => void;
}

const ContentManagementPage: React.FC<ContentManagementPageProps> = ({
  currentScreen,
  onNavigate,
  onBack,
}) => {
  const [elements, setElements] = useState<ContentElement[]>([
    {
      id: '1',
      type: 'banner',
      name: 'Homepage Banner',
      currentText: 'Welcome to Canny Carrot',
    },
    {
      id: '2',
      type: 'carousel',
      name: 'Rewards Carousel',
      currentText: 'Featured Rewards',
    },
    {
      id: '3',
      type: 'homescreen',
      name: 'Marketing Message',
      currentText: 'Special Christmas Offer',
    },
  ]);

  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const pickImage = async (elementId: string) => {
    // TODO: Implement with expo-image-picker
    Alert.alert('Info', 'Image picker will be implemented with expo-image-picker');
    // const result = await ImagePicker.launchImageLibraryAsync({
    //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //   allowsEditing: true,
    //   quality: 1,
    // });
    // if (!result.canceled) {
    //   setElements(
    //     elements.map(e =>
    //       e.id === elementId
    //         ? {...e, currentImage: result.assets[0].uri}
    //         : e,
    //     ),
    //   );
    //   Alert.alert('Success', 'Image updated. Changes will be pushed to apps.');
    // }
  };

  const handleEdit = (element: ContentElement) => {
    setEditingElement(element.id);
    setEditText(element.currentText || '');
  };

  const handleSave = (elementId: string) => {
    setElements(
      elements.map(e =>
        e.id === elementId ? {...e, currentText: editText} : e,
      ),
    );
    setEditingElement(null);
    Alert.alert('Success', 'Content updated. Changes will be pushed to apps.');
  };

  return (
    <PageTemplate
      title="Content Management"
      currentScreen={currentScreen}
      onNavigate={onNavigate}
      onBack={onBack}>
      <View style={styles.content}>
        <Text style={styles.description}>
          Edit images and content for customer and business apps. Changes are
          pushed to all apps automatically.
        </Text>

        <ScrollView style={styles.list}>
          {elements.map((element) => (
            <View key={element.id} style={styles.elementCard}>
              <Text style={styles.elementName}>{element.name}</Text>
              <Text style={styles.elementType}>
                Type: {element.type.toUpperCase()}
              </Text>

              {element.currentImage && (
                <Image
                  source={{uri: element.currentImage}}
                  style={styles.thumbnail}
                />
              )}

              {editingElement === element.id ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={editText}
                    onChangeText={setEditText}
                    multiline
                    placeholder="Enter content..."
                    placeholderTextColor={Colors.text.light}
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={() => handleSave(element.id)}>
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setEditingElement(null)}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View>
                  {element.currentText && (
                    <Text style={styles.currentText}>{element.currentText}</Text>
                  )}
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEdit(element)}>
                      <Text style={styles.editButtonText}>Edit Text</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.imageButton}
                      onPress={() => pickImage(element.id)}>
                      <Text style={styles.imageButtonText}>
                        {element.currentImage ? 'Change Image' : 'Upload Image'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </PageTemplate>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  list: {
    flex: 1,
  },
  elementCard: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  elementName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  elementType: {
    fontSize: 12,
    color: Colors.text.light,
    marginBottom: 12,
  },
  thumbnail: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: Colors.neutral[200],
  },
  currentText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 12,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  editButtonText: {
    color: Colors.background,
    fontWeight: '600',
  },
  imageButton: {
    flex: 1,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  imageButtonText: {
    color: Colors.background,
    fontWeight: '600',
  },
  editContainer: {
    marginTop: 12,
  },
  editInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    color: Colors.text.primary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.background,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.neutral[300],
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
});

export default ContentManagementPage;


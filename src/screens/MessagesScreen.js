import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

export default function MessagesScreen() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock conversation data
  const conversations = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      lastMessage: 'Thanks for the great session today!',
      time: '2:30 PM',
      unread: 2,
      avatar: 'https://via.placeholder.com/50x50',
      online: true,
    },
    {
      id: 2,
      name: 'Michael Chen',
      lastMessage: 'When can we schedule our next meeting?',
      time: '1:15 PM',
      unread: 0,
      avatar: 'https://via.placeholder.com/50x50',
      online: false,
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      lastMessage: 'I\'ve shared the design files with you',
      time: '11:45 AM',
      unread: 1,
      avatar: 'https://via.placeholder.com/50x50',
      online: true,
    },
    {
      id: 4,
      name: 'David Kim',
      lastMessage: 'The Python tutorial was very helpful',
      time: 'Yesterday',
      unread: 0,
      avatar: 'https://via.placeholder.com/50x50',
      online: false,
    },
    {
      id: 5,
      name: 'Lisa Wong',
      lastMessage: 'Can you review my portfolio?',
      time: 'Yesterday',
      unread: 3,
      avatar: 'https://via.placeholder.com/50x50',
      online: true,
    },
  ];

  const filteredConversations = conversations.filter(conversation =>
    conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('messages')}</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchConversations')}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.conversationsContainer}>
          {filteredConversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.id}
              style={styles.conversationItem}
              activeOpacity={0.7}
            >
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: conversation.avatar }}
                  style={styles.avatar}
                />
                {conversation.online && <View style={styles.onlineIndicator} />}
              </View>

              <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                  <Text style={styles.conversationName}>{conversation.name}</Text>
                  <Text style={styles.conversationTime}>{conversation.time}</Text>
                </View>
                <View style={styles.messageContainer}>
                  <Text
                    style={[
                      styles.lastMessage,
                      conversation.unread > 0 && styles.unreadMessage,
                    ]}
                    numberOfLines={1}
                  >
                    {conversation.lastMessage}
                  </Text>
                  {conversation.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadCount}>{conversation.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredConversations.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>{t('noConversationsFound')}</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? t('tryAdjustingSearch') : t('startConnecting')}
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
  },
  conversationsContainer: {
    paddingVertical: 10,
  },
  conversationItem: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ddd',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: 'white',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  conversationTime: {
    fontSize: 12,
    color: '#666',
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  unreadMessage: {
    color: '#333',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#667eea',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

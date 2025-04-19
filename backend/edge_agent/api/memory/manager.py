import logging
from typing import List, Dict, Any, Optional, Union
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from edge_agent.models.database import Message, Conversation
from edge_agent.utils.embedding import get_similar_messages, get_embedding

logger = logging.getLogger("memory_manager")

class MemoryManager:
    """
    Memory Manager - Manage different memory strategies
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def generate_memory(
        self, 
        conversation_id: str, 
        current_msg: str, 
        strategy: int = 1,
        system_prompt: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Generate memory context based on strategy
        
        Strategy:
        0 - Only current message
        1 - Recent N messages
        2 - Recent N messages + Semantic-related TopK messages
        3 - Recent N messages + Filtered semantic-related TopK messages
        """
        try:
            # 默认系统提示
            if not system_prompt:
                system_prompt = "You are a helpful AI assistant."
                
            # 创建记忆数组，始终以系统提示开始
            memory = [{"role": "system", "content": system_prompt}]
            
            # 策略0: 只包含当前消息
            if strategy == 0:
                memory.append({"role": "user", "content": current_msg})
                return memory
                
            # 策略1: 最近的N条消息
            if strategy >= 1:
                # 查询最近的10条消息
                recent_messages_query = select(Message).where(
                    Message.conversation_id == conversation_id
                ).order_by(desc(Message.created_at)).limit(10)
                
                result = await self.db.execute(recent_messages_query)
                recent_messages = result.scalars().all()
                
                # 按时间正序排列
                recent_messages.reverse()
                
                # 添加到记忆
                for msg in recent_messages:
                    content = msg.content
                    if isinstance(content, dict) and "text" in content:
                        content = content["text"]
                    memory.append({"role": msg.role, "content": content})
            
            # 策略2: 添加语义相关的消息
            if strategy >= 2:
                similar_messages = await get_similar_messages(
                    self.db, 
                    conversation_id, 
                    current_msg, 
                    limit=5,
                    include_context=False
                )
                
                # 添加相关消息（避免重复）
                existing_ids = {msg.get("id") for msg in memory if "id" in msg}
                for msg in similar_messages:
                    if msg["id"] not in existing_ids:
                        content = msg["content"]
                        if isinstance(content, dict) and "text" in content:
                            content = content["text"]
                        memory.append({
                            "id": msg["id"],
                            "role": msg["role"],
                            "content": content
                        })
                        existing_ids.add(msg["id"])
            
            # 策略3: 添加经过过滤的语义相关消息
            if strategy >= 3:
                # 这里可以根据需要添加额外的过滤逻辑
                # 例如，过滤掉工具调用消息
                memory = [msg for msg in memory if msg.get("role") != "tooling"]
                
                # 如果需要，还可以添加上下文相关的消息
                # 例如，为每个相关消息添加前后的对话
                
            # 添加当前消息（如果不在最近消息中）
            memory.append({"role": "user", "content": current_msg})
            
            # 移除ID字段，保持标准的OpenAI消息格式
            for msg in memory:
                msg.pop("id", None)
                
            return memory
            
        except Exception as e:
            logger.error(f"Error generating memory: {str(e)}")
            # 在错误情况下返回基本记忆
            return [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": current_msg}
            ]

    async def add_message_to_memory(self, message_id: str) -> bool:
        """
        Add new message to memory system
        """
        from edge_agent.utils.embedding import store_message_embedding
        
        try:
            # 存储消息的嵌入
            await store_message_embedding(self.db, message_id)
            return True
        except Exception as e:
            logger.error(f"Error adding message to memory: {str(e)}")
            return False 
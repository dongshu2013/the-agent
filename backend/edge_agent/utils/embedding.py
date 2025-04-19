import logging
import asyncio
from typing import List, Dict, Any, Optional, Union
import openai
import json
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from edge_agent.models.database import Message, MessageEmbedding
from edge_agent.core.config import settings

logger = logging.getLogger("embedding")

# 初始化OpenAI客户端
client = openai.AsyncClient(api_key=settings.OPENAI_API_KEY)
MODEL = "text-embedding-ada-002"  # OpenAI嵌入模型

async def get_embedding(text: str) -> List[float]:
    """
    使用OpenAI API获取文本的嵌入向量
    """
    try:
        # 处理可能的JSON内容
        if isinstance(text, dict) or isinstance(text, list):
            text = json.dumps(text)
            
        # 确保是文本
        text = str(text).strip()
        
        # 对空文本的处理
        if not text:
            logger.warning("Empty text provided for embedding")
            return [0.0] * 1536  # 返回零向量
            
        # 调用OpenAI API
        response = await client.embeddings.create(
            model=MODEL,
            input=text,
        )
        
        # 提取嵌入
        embedding = response.data[0].embedding
        return embedding
        
    except Exception as e:
        logger.error(f"Error generating embedding: {str(e)}")
        # 在错误情况下返回零向量
        return [0.0] * 1536

async def store_message_embedding(db: AsyncSession, message_id: str) -> Optional[MessageEmbedding]:
    """
    为指定消息生成并存储嵌入向量
    """
    try:
        # 获取消息
        message = await db.get(Message, message_id)
        if not message:
            logger.error(f"Message not found: {message_id}")
            return None
            
        # 提取消息内容
        content_text = ""
        if isinstance(message.content, list):
            # 处理多段内容
            for item in message.content:
                if isinstance(item, dict) and "text" in item:
                    content_text += item["text"] + " "
        elif isinstance(message.content, dict) and "text" in message.content:
            # 处理单段内容
            content_text = message.content["text"]
        else:
            # 处理其他情况
            content_text = str(message.content)
            
        # 获取嵌入
        embedding = await get_embedding(content_text)
        
        # 创建嵌入记录
        message_embedding = MessageEmbedding(
            message_id=message_id,
            embedding=embedding
        )
        
        # 存储到数据库
        db.add(message_embedding)
        await db.commit()
        await db.refresh(message_embedding)
        
        return message_embedding
        
    except Exception as e:
        await db.rollback()
        logger.error(f"Error storing message embedding: {str(e)}")
        return None

async def get_similar_messages(
    db: AsyncSession, 
    conversation_id: str, 
    query_text: str, 
    limit: int = 5,
    include_context: bool = False,
    context_size: int = 1
) -> List[Dict[str, Any]]:
    """
    获取与查询文本语义相似的消息
    """
    try:
        # 获取查询文本的嵌入
        query_embedding = await get_embedding(query_text)
        
        # 执行查询
        sql = """
        SELECT * FROM find_similar_messages(:conversation_id, :embedding, :limit)
        """
        result = await db.execute(
            sql, 
            {
                "conversation_id": conversation_id, 
                "embedding": query_embedding, 
                "limit": limit
            }
        )
        similar_messages = result.fetchall()
        
        # 格式化结果
        messages = []
        for row in similar_messages:
            message = {
                "id": row.message_id,
                "role": row.role,
                "content": row.content,
                "created_at": row.created_at.isoformat(),
                "similarity": float(row.similarity)
            }
            messages.append(message)
            
            # 获取消息上下文
            if include_context and context_size > 0:
                context_sql = """
                SELECT * FROM get_message_context(:conversation_id, :message_id, :context_size)
                """
                context_result = await db.execute(
                    context_sql,
                    {
                        "conversation_id": conversation_id,
                        "message_id": row.message_id,
                        "context_size": context_size
                    }
                )
                context_messages = context_result.fetchall()
                
                # 添加上下文消息
                for ctx_row in context_messages:
                    ctx_message = {
                        "id": ctx_row.message_id,
                        "role": ctx_row.role,
                        "content": ctx_row.content,
                        "created_at": ctx_row.created_at.isoformat(),
                        "is_context": True
                    }
                    messages.append(ctx_message)
                    
        return messages
        
    except Exception as e:
        logger.error(f"Error getting similar messages: {str(e)}")
        return [] 
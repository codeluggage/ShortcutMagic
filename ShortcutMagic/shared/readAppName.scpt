FasdUAS 1.101.10   ��   ��    k             i         I      �� 	���� 0 readappname readAppName 	  
�� 
 o      ���� 0 argv  ��  ��    O     Z    k    Y       l   ��  ��    = 7 return get name of first process where it is frontmost     �   n   r e t u r n   g e t   n a m e   o f   f i r s t   p r o c e s s   w h e r e   i t   i s   f r o n t m o s t      l   ��������  ��  ��        l   ��  ��    I C TODO: simplify this when previous app name is stored in javascript     �   �   T O D O :   s i m p l i f y   t h i s   w h e n   p r e v i o u s   a p p   n a m e   i s   s t o r e d   i n   j a v a s c r i p t      r        6      4   ��  
�� 
prcs   m    ����   =  	  ! " ! n   
  # $ # 1   
 ��
�� 
pisf $  g   
 
 " m    ��
�� boovtrue  o      ���� $0 frontmostprocess frontmostProcess   % & % r     ' ( ' m    ��
�� boovfals ( n       ) * ) 1    ��
�� 
pvis * o    ���� $0 frontmostprocess frontmostProcess &  + , + V    . - . - I  $ )�� /��
�� .sysodelanull��� ��� nmbr / m   $ % 0 0 ?���������   . l   # 1���� 1 =   # 2 3 2 n    ! 4 5 4 1    !��
�� 
pisf 5 o    ���� $0 frontmostprocess frontmostProcess 3 m   ! "��
�� boovtrue��  ��   ,  6 7 6 r   / @ 8 9 8 6 / > : ; : n   / 5 < = < 1   3 5��
�� 
pnam = 4  / 3�� >
�� 
prcs > m   1 2����  ; =  6 = ? @ ? n   7 9 A B A 1   7 9��
�� 
pisf B  g   7 7 @ m   : <��
�� boovtrue 9 o      ���� 0 
targetname 
targetName 7  C D C Z   A V E F���� E l  A D G���� G =  A D H I H o   A B���� 0 argv   I m   B C J J � K K  t r u e��  ��   F k   G R L L  M N M r   G L O P O m   G H��
�� boovtrue P n       Q R Q 1   I K��
�� 
pisf R o   H I���� $0 frontmostprocess frontmostProcess N  S�� S r   M R T U T m   M N��
�� boovtrue U n       V W V 1   O Q��
�� 
pvis W o   N O���� $0 frontmostprocess frontmostProcess��  ��  ��   D  X�� X L   W Y Y Y o   W X���� 0 
targetname 
targetName��    m      Z Z�                                                                                  sevs  alis    �  Macintosh HD               ��@rH+  :�System Events.app                                              N&���        ����  	                CoreServices    ��x�      ���    :�:�:�  =Macintosh HD:System: Library: CoreServices: System Events.app   $  S y s t e m   E v e n t s . a p p    M a c i n t o s h   H D  -System/Library/CoreServices/System Events.app   / ��     [ \ [ l     ��������  ��  ��   \  ] ^ ] i     _ ` _ I     �� a��
�� .aevtoappnull  �   � **** a l      b���� b o      ���� 0 argv  ��  ��  ��   ` L      c c I     �� d���� 0 readappname readAppName d  e�� e o    ���� 0 argv  ��  ��   ^  f g f l     ��������  ��  ��   g  h i h l     ��������  ��  ��   i  j k j l     �� l m��   l @ :- potentially use this to avoid selecting SW as first app:    m � n n t -   p o t e n t i a l l y   u s e   t h i s   t o   a v o i d   s e l e c t i n g   S W   a s   f i r s t   a p p : k  o p o l     ��������  ��  ��   p  q r q l     �� s t��   s ' ! tell application "System Events"    t � u u B   t e l l   a p p l i c a t i o n   " S y s t e m   E v e n t s " r  v w v l     �� x y��   x F @     set frontmostProcess to first process where it is frontmost    y � z z �           s e t   f r o n t m o s t P r o c e s s   t o   f i r s t   p r o c e s s   w h e r e   i t   i s   f r o n t m o s t w  { | { l     �� } ~��   } 3 -     set visible of frontmostProcess to false    ~ �   Z           s e t   v i s i b l e   o f   f r o n t m o s t P r o c e s s   t o   f a l s e |  � � � l     �� � ���   � 7 1     repeat while (frontmostProcess is frontmost)    � � � � b           r e p e a t   w h i l e   ( f r o n t m o s t P r o c e s s   i s   f r o n t m o s t ) �  � � � l     �� � ���   �           delay 0.2    � � � � $                   d e l a y   0 . 2 �  � � � l     �� � ���   �       end repeat    � � � �            e n d   r e p e a t �  � � � l     �� � ���   � M G     set secondFrontmost to name of first process where it is frontmost    � � � � �           s e t   s e c o n d F r o n t m o s t   t o   n a m e   o f   f i r s t   p r o c e s s   w h e r e   i t   i s   f r o n t m o s t �  � � � l     �� � ���   � 4 .     set frontmost of frontmostProcess to true    � � � � \           s e t   f r o n t m o s t   o f   f r o n t m o s t P r o c e s s   t o   t r u e �  � � � l     �� � ���   �  	 end tell    � � � �    e n d   t e l l �  � � � l     ��������  ��  ��   �  � � � l     �� � ���   � ? 9 tell application (path to frontmost application as text)    � � � � r   t e l l   a p p l i c a t i o n   ( p a t h   t o   f r o n t m o s t   a p p l i c a t i o n   a s   t e x t ) �  � � � l     �� � ���   � 1 +     if "Finder" is in secondFrontmost then    � � � � V           i f   " F i n d e r "   i s   i n   s e c o n d F r o n t m o s t   t h e n �  � � � l     �� � ���   � : 4         display dialog ("Finder was last in front")    � � � � h                   d i s p l a y   d i a l o g   ( " F i n d e r   w a s   l a s t   i n   f r o n t " ) �  � � � l     �� � ���   �  	     else    � � � �            e l s e �  � � � l     �� � ���   � F @         display dialog (secondFrontmost & " was last in front")    � � � � �                   d i s p l a y   d i a l o g   ( s e c o n d F r o n t m o s t   &   "   w a s   l a s t   i n   f r o n t " ) �  � � � l     �� � ���   �       end if    � � � �            e n d   i f �  � � � l     �� � ���   �  	 end tell    � � � �    e n d   t e l l �  ��� � l     ��������  ��  ��  ��       �� � � ���   � ������ 0 readappname readAppName
�� .aevtoappnull  �   � **** � �� ���� � ����� 0 readappname readAppName�� �� ���  �  ���� 0 argv  ��   � �������� 0 argv  �� $0 frontmostprocess frontmostProcess�� 0 
targetname 
targetName � 	 Z�� ����� 0���� J
�� 
prcs �  
�� 
pisf
�� 
pvis
�� .sysodelanull��� ��� nmbr
�� 
pnam�� [� W*�k/�[�,\Ze81E�Of��,FO h��,e �j [OY��O*�k/�,�[�,\Ze81E�O��  e��,FOe��,FY hO�U � �� `���� � ���
�� .aevtoappnull  �   � ****�� 0 argv  ��   � ���� 0 argv   � ���� 0 readappname readAppName�� *�k+  ascr  ��ޭ